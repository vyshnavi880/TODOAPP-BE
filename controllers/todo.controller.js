
const gettodo = (req, res) => {
    res.send('data getting')
}

const createtodo = (req, res) => {
    const {title,description}=req.body
    if(!title||!description){
        res.status(400);
        throw new Error('All fiels are mendatory')
    }
    //res.json(req.body)
}

const edittodo = (req, res) => {
    res.send('data getting')
}

const deletetodo = (req, res) => {
    res.send('data getting')
}

module.exports = { gettodo,createtodo,edittodo,deletetodo }