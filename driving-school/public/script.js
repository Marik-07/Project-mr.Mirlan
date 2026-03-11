const API = "http://localhost:3000"

// Регистрация
function register(){
  const login = document.getElementById("login").value
  const password = document.getElementById("password").value
  const phone = document.getElementById("phone").value

  fetch(API + "/register",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({login,password,phone})
  }).then(res=>res.json())
    .then(data=>{
      if(data.success){
        alert("Регистрация успешна")
        window.location.href="login.html"
      }else{
        alert("Ошибка регистрации")
      }
    })
}

// Вход
function login(){
  const login = document.getElementById("login").value
  const password = document.getElementById("password").value

  fetch(API + "/login",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({login,password})
  }).then(res=>res.json())
    .then(user=>{
      if(user.error){
        alert("Неверный логин или пароль")
      }else{
        localStorage.setItem("user",JSON.stringify(user))
        window.location.href="dashboard.html"
      }
    })
}

// Показ инструкторов на dashboard
if(location.pathname.includes("dashboard.html")){
  const instructorsDiv = document.getElementById("instructors")
  fetch(API+"/instructors")
    .then(res=>res.json())
    .then(data=>{
      data.forEach(i=>{
        instructorsDiv.innerHTML += `
        <div class="instructor-card">
          <div>
            <b>${i.name}</b><br>
            Цена: 1000 сом / час
          </div>
          <div>
            <a href="instructor.html?id=${i.id}">
              <button>Открыть график</button>
            </a>
          </div>
        </div>
        `
      })
    })
}

// Получение графика инструктора и запись
if(location.pathname.includes("instructor.html")){
  const params = new URLSearchParams(location.search)
  const id = params.get("id")
  const scheduleDiv = document.getElementById("schedule")
  const times = ["10:00","12:00","14:00","16:00","18:00"]

  fetch(API+"/schedule/"+id)
    .then(res=>res.json())
    .then(booked=>{
      const week=[]
      for(let i=0;i<7;i++){
        const d=new Date()
        d.setDate(d.getDate()+i)
        week.push(d.toISOString().split("T")[0])
      }

      week.forEach(day=>{
        let html = `<div class="schedule-day"><h3>${day}</h3>`
        times.forEach(time=>{
          const busy = booked.find(b=>b.date==day && b.time==time)
          if(!busy){
            html += `<button class="time-slot" onclick="book('${day}','${time}',${id})">${time}</button>`
          }else{
            html += `<span class="time-slot" style="color:red;">${time} (занято)</span>`
          }
        })
        html += `</div>`
        scheduleDiv.innerHTML += html
      })
    })
}

function book(date,time,instructor){
  const user = JSON.parse(localStorage.getItem("user"))
  fetch(API+"/book",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({user_id:user.id,instructor_id:instructor,date,time})
  }).then(res=>res.json())
    .then(data=>{
      if(data.success){
        alert("Запись создана")
        location.reload()
      }else{
        alert("Время занято")
      }
    })
}

// Мои записи
if(location.pathname.includes("bookings.html")){
  const user = JSON.parse(localStorage.getItem("user"))
  const mybookingsDiv = document.getElementById("mybookings")

  fetch(API+"/mybookings/"+user.id)
    .then(res=>res.json())
    .then(data=>{
      data.forEach(b=>{
        mybookingsDiv.innerHTML += `
        <div>
          Инструктор: ${b.name}<br>
          Дата: ${b.date}<br>
          Время: ${b.time}<br>
          <button onclick="deleteBooking(${b.id})">Удалить</button>
          <hr>
        </div>
        `
      })
    })
}

function deleteBooking(id){
  fetch(API+"/delete/"+id,{method:"DELETE"})
    .then(()=>location.reload())
}