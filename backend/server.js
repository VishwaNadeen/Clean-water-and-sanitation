import express from "express";

const app = express();
const PORT = 5001;

app.get("/api/notes", (req,res) =>{
    res.send("Hello");
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});