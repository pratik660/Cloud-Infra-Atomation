const express = require("express")
const cors = require("cors")
const { exec } = require("child_process")

const app = express()
app.use(cors())
app.use(express.json())

let status = "Stopped"
let ip = ""

// 🚀 CREATE INFRA
app.post("/create-infra", (req, res) => {

  console.log("🚀 Create Infra API HIT")

  status = "Creating..."

  exec("terraform apply -auto-approve", { cwd: "../terraform" }, (err, stdout, stderr) => {

    console.log("📤 STDOUT:\n", stdout)
    console.log("⚠️ STDERR:\n", stderr)

    if (err) {
      console.log("❌ ERROR:", err)
      status = "Error"

      return res.json({
        status: status,
        ip: ""
      })
    }

    // ✅ Always fetch IP after apply
    exec("terraform output -raw instance_ip", { cwd: "../terraform" }, (err2, stdout2) => {

      if (err2) {
        console.log("❌ Output Error:", err2)

        status = "Running"
        return res.json({
          status: status,
          ip: "Check AWS Console"
        })
      }

      ip = stdout2.trim()
      status = "Running"

      console.log("🌐 Instance IP:", ip)

      res.json({
        status: status,
        ip: ip
      })

    })

  })
})


// 📊 CHECK STATUS (REAL DATA)
app.get("/status", (req, res) => {

  console.log("📊 Status API HIT")

  exec("terraform output -raw instance_ip", { cwd: "../terraform" }, (err, stdout) => {

    if (err) {
      console.log("⚠️ Status Error:", err)

      return res.json({
        status: "Not Created",
        ip: ""
      })
    }

    const ip = stdout.trim()

    res.json({
      status: "Running",
      ip: ip
    })

  })

})


// 💣 DESTROY INFRA
app.post("/destroy-infra", (req, res) => {

  console.log("💣 Destroy Infra API HIT")

  status = "Destroying..."

  exec("terraform destroy -auto-approve", { cwd: "../terraform" }, (err, stdout, stderr) => {

    console.log("📤 STDOUT:\n", stdout)
    console.log("⚠️ STDERR:\n", stderr)

    if (err) {
      console.log("❌ ERROR:", err)
      status = "Error"

      return res.json({
        status: status,
        ip: ""
      })
    }

    // ✅ Reset state after destroy
    status = "Stopped"
    ip = ""

    console.log("🗑️ Infrastructure Destroyed")

    res.json({
      status: status,
      ip: ip
    })

  })

})


// 🟢 SERVER START
app.listen(5000, () => {
  console.log("✅ Server running on port 5000")
})