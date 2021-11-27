var express = require("express")
var path = require("path")
var app = express();
var hbs = require('express-handlebars');
const Datastore = require('nedb')
const PORT = process.env.PORT || 3000;

const pojazdy = new Datastore({
    filename: "pojazdy.db",
    autoload: true
})

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));


app.get("/", function (req, res) {
    res.render("form.hbs");
})

app.get("/dodaj", function (req, res) {
    let obj = {
        ubezpieczony: req.query.ubezpieczony == "Tak" ? "Tak" : "Nie",
        benzyna: req.query.benzyna == "Tak" ? "Tak" : "Nie",
        uszkodzony: req.query.uszkodzony == "Tak" ? "Tak" : "Nie",
        naped4x4: req.query.naped4x4 == "Tak" ? "Tak" : "Nie"
    }
    console.log(obj)

    pojazdy.insert(obj, function (err, newDoc) {
        console.log("dodano dokument (obiekt):")
        console.log(newDoc)
        console.log("losowe id dokumentu: " + newDoc._id)
    });

    let context = { pojazdy: [] }
    pojazdy.find({}, function (err, docs) {
        context.pojazdy = docs
        res.render("form.hbs", context);
    });
})

app.get("/editCar", function (req, res) {
    let context = { pojazdy: [] }
    pojazdy.find({}, function (err, docs) {
        context.pojazdy = docs
        context.pojazdy.forEach(element => {
            if (element._id == req.query.id) {
                element.edit = "true"
            }
        });
        res.render("form.hbs", context);
    });
})

app.get("/updateCar", function (req, res) {
    let context = { pojazdy: [] }
    let obj = {
        ubezpieczony: req.query.ubezpieczony == "Tak" ? "Tak" : "Nie",
        benzyna: req.query.benzyna == "Tak" ? "Tak" : "Nie",
        uszkodzony: req.query.uszkodzony == "Tak" ? "Tak" : "Nie",
        naped4x4: req.query.naped4x4 == "Tak" ? "Tak" : "Nie"
    }
    pojazdy.update({ _id: req.query.id }, { $set: obj }, {}, function (err, numUpdated) {
        pojazdy.find({}, function (err, docs) {
            context.pojazdy = docs
            res.render("form.hbs", context)
        });
    });
})

app.get("/deleteCar", function (req, res) {
    let context = { pojazdy: [] }
    pojazdy.remove({ _id: req.query.id }, {}, function (err, numRemoved) {
        console.log("usunięto dokumentów: ", numRemoved)
        pojazdy.find({}, function (err, docs) {
            context.pojazdy = docs
            res.render("form.hbs", context)
        });
    });
})


app.use(express.static('static'))


app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', hbs({ defaultLayout: 'main.hbs' }));
app.set('view engine', 'hbs');

app.listen(PORT, function () {
    console.log("start serwera na porcie " + PORT)
})