const express = require("express")
const cors = require("cors")
const { exec } = require("child_process")

const app = express()
app.use(cors())
app.use(express.json())

// ✅ YOUR ACTUAL TERRAFORM PATH (FIXED)
const terraformExe = `"C:\\Users\\shelk\\Downloads\\terraform_1.12.0_windows_386\\terraform.exe"`
// 📁 Terraform folder
const tfPath = "../terraform"

console.log("📁 Terraform Folder:", tfPath)
console.log("⚙️ Terraform Executable:", terraformExe)


// 🔥 COMMON RUNNER FUNCTION
const runTerraform = (cmd, res, successMsg) => {

  const fullCmd = `${terraformExe} ${cmd}`

  console.log("\n🚀 Running Command:\n", fullCmd)

  exec(fullCmd, { cwd: tfPath }, (err, stdout, stderr) => {

    console.log("📤 STDOUT:\n", stdout)
    console.log("⚠️ STDERR:\n", stderr)

    if (err) {
      console.log("❌ ERROR:", err.message)

      return res.json({
        status: "Error",
        error: stderr || err.message
      })
    }

    // ✅ Fetch outputs
    exec(`${terraformExe} output -json`, { cwd: tfPath }, (e, out) => {

      if (e) {
        return res.json({
          status: successMsg,
          ip: "",
          bucket: "",
          vpc: ""
        })
      }

      const data = JSON.parse(out || "{}")

      res.json({
        status: successMsg,
        ip: data.instance_ip?.value || "",
        bucket: data.bucket_name?.value || "",
        vpc: data.vpc_id?.value || ""
      })
    })
  })
}


// 🌐 CREATE VPC
app.post("/create-vpc", (req, res) => {
  runTerraform(
    "apply -target=aws_vpc.main -target=aws_subnet.subnet -target=aws_internet_gateway.igw -target=aws_route_table.rt -target=aws_route.route -target=aws_route_table_association.rta -auto-approve",
    res,
    "VPC Created"
  )
})


// 🪣 CREATE S3
app.post("/create-s3", (req, res) => {
  runTerraform(
    "apply -target=aws_s3_bucket.bucket -auto-approve",
    res,
    "S3 Bucket Created"
  )
})


// 🖥️ CREATE EC2
app.post("/create-ec2", (req, res) => {
  runTerraform(
    "apply -auto-approve",
    res,
    "EC2 Created"
  )
})


// ⚡ FULL INFRA
app.post("/create-full", (req, res) => {
  runTerraform(
    "apply -auto-approve",
    res,
    "Full Infrastructure Created"
  )
})


// 💣 DESTROY ALL
app.post("/destroy-all", (req, res) => {
  runTerraform(
    "destroy -auto-approve",
    res,
    "Infrastructure Destroyed"
  )
})


// 📊 STATUS
app.get("/status", (req, res) => {

  console.log("📊 Checking Status...")

  exec(`${terraformExe} output -json`, { cwd: tfPath }, (err, stdout) => {

    if (err) {
      return res.json({
        status: "Not Created",
        ip: "",
        bucket: "",
        vpc: ""
      })
    }

    const data = JSON.parse(stdout || "{}")

    res.json({
      status: "Running",
      ip: data.instance_ip?.value || "",
      bucket: data.bucket_name?.value || "",
      vpc: data.vpc_id?.value || ""
    })
  })
})


// 🧪 CHECK TERRAFORM
app.get("/check-tf", (req, res) => {

  exec(`${terraformExe} version`, (err, stdout) => {

    if (err) {
      return res.send("❌ Terraform NOT working\n" + err.message)
    }

    res.send("✅ Terraform Working:\n\n" + stdout)
  })
})


// 🟢 START SERVER
app.listen(5000, () => {
  console.log("✅ Server running on http://localhost:5000")
})