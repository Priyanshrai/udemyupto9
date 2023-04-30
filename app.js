const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const errorController = require("./controllers/error");
const sequelize = require("./util/database");
const Product = require('./models/product')
const User = require("./models/user");

var cors = require("cors");

const app = express();


const expense = require("./models/expenses");

app.use(cors());

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
// const userRoutes = require("./routes/user")
const expenseRoutes = require("./routes/expense")
const Cart= require("./models/cart");
const CartItem=require("./models/cart-item")

app.use(bodyParser.urlencoded({extended : false}));
app.use(express.static(path.join(__dirname, "public")));

app.use((req,res,next)=>{
  User.findByPk(1)
  .then(user=>{
    req.user=user;
    next();
  })
  .catch((err)=>console.log(err))
})

app.use("/admin", adminRoutes);
app.use(shopRoutes);

// app.use("/user", userRoutes)

app.use("/expense", expenseRoutes)



app.use(errorController.get404);



Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, {through: CartItem});
Product.belongsToMany(Cart, {through: CartItem});

sequelize
  // .sync({force: true})
  .sync()
  .then((result) => {
    return User.findByPk(1);
  })
  .then(user => {
    if(!user){
      return User.create({name:'max',email:'test@test.com'})
    }
    return user;
    })
    .then(user=>{
      // console.log(user)
      return user.createCart();
  })
  .then(cart => {
    app.listen(3000)
  })
  .catch((err) => {
    console.log(err);
  });
