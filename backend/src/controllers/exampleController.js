export function getAllExample (req, res) {
  res.status(200).send("You just fetched this");
}

export function createExample (req, res) {
  res.status(201).send("Created successfully!");
}

export function updateExample (req, res){
    res.status(200).json("Updated successfully!");
}

export function deleteExample (req, res){
    res.status(200).json("Deleted successfully!");
}