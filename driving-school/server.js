const express = require("express")
const sqlite3 = require("sqlite3").verbose()
const bodyParser = require("body-parser")
const cors = require("cors")

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(express.static("public"))

const db = new sqlite3.Database("database.db")

// Создание таблиц
db.serialize(()=>{
  db.run(`CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    login TEXT,
    password TEXT,
    phone TEXT
  )`)

  db.run(`CREATE TABLE IF NOT EXISTS instructors(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT
  )`)

  db.run(`CREATE TABLE IF NOT EXISTS bookings(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    instructor_id INTEGER,
    date TEXT,
    time TEXT
  )`)

  // Добавим инструкторов
  db.run(`INSERT OR IGNORE INTO instructors (id,name) VALUES
    (1,'Азамат'),
    (2,'Руслан'),
    (3,'Бакыт')
  `)
})

// Регистрация
app.post("/register",(req,res)=>{
  const {login,password,phone}=req.body
  db.run(`INSERT INTO users(login,password,phone) VALUES(?,?,?)`,
    [login,password,phone],
    function(err){
      if(err) return res.send({error:true})
      res.send({success:true})
    })
})

// Вход
app.post("/login",(req,res)=>{
  const {login,password}=req.body
  db.get(`SELECT * FROM users WHERE login=? AND password=?`,
    [login,password],
    (err,row)=>{
      if(!row) return res.send({error:true})
      res.send(row)
    })
})

// Список инструкторов
app.get("/instructors",(req,res)=>{
  db.all(`SELECT * FROM instructors`,(err,rows)=>{
    res.send(rows)
  })
})

// Занятые слоты инструктора
app.get("/schedule/:id",(req,res)=>{
  const id=req.params.id
  db.all(`SELECT date,time FROM bookings WHERE instructor_id=?`,
    [id],(err,rows)=>{
      res.send(rows)
    })
})

// Создание записи
app.post("/book",(req,res)=>{
  const {user_id,instructor_id,date,time}=req.body
  db.get(`SELECT * FROM bookings WHERE instructor_id=? AND date=? AND time=?`,
    [instructor_id,date,time],
    (err,row)=>{
      if(row) return res.send({error:"busy"})
      db.run(`INSERT INTO bookings(user_id,instructor_id,date,time)
        VALUES(?,?,?,?)`,
        [user_id,instructor_id,date,time],
        ()=>{
          res.send({success:true})
        })
    })
})

// Мои записи
app.get("/mybookings/:id",(req,res)=>{
  const id=req.params.id
  db.all(`SELECT bookings.id,instructors.name,date,time
    FROM bookings
    JOIN instructors ON instructors.id=bookings.instructor_id
    WHERE user_id=?`,
    [id],(err,rows)=>{
      res.send(rows)
    })
})

// Удаление записи
app.delete("/delete/:id",(req,res)=>{
  db.run(`DELETE FROM bookings WHERE id=?`,
    [req.params.id],
    ()=>{
      res.send({success:true})
    })
})

app.listen(3000,()=>console.log("Server started http://localhost:3000"))