const express = require('express');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const port = process.env.PORT || 3500
var mongodb = require('mongodb');
const session = require('express-session');
const MongoDBSession = require('connect-mongodb-session')(session);
const url = require('url');
const { existsSync } = require('fs');
var ObjectId = require('mongodb').ObjectId;
const app = express();


//payment 
var Publishable_Key = 'pk_test_51LCMniIAN3U8yPtfrHELC6yDrcbeNzcH4LzOINHEDa2TZQbm6gMe0mix1acsJUJxD3U9VtiG86h98rOj4iiOTphy00GYvhJfuJ'
var Secret_Key = 'sk_test_51LCMniIAN3U8yPtfzftO7CZ1h5FVPNXOJ8yelL7vlDupCLEIxYlrkpI5dPY1hSlt1HYhqgh9GjKfdKIwUjN7lQ2f00U25vwfyg'

const stripe = require('stripe')(Secret_Key)



//DB
const MongoDBUri = "mongodb+srv://test1:test1@cluster0.7faqe.mongodb.net/firstDB";
mongoose.connect(MongoDBUri,{ useNewUrlParser: true },{ useUnifiedTopology: true } );
const accountSchema = {
    username : String,
    password : String,
    profile : String,
}
const adminSchema = {
    category : String,
    quantity : String,
    amount : String,
    productimg : String,
}
const cartSchema = {
    username : String,
    category : String,
    quantity : String,
    amount : String,
    productimg : String,
    productId: String,
}
const OrderSchema = {
    username: String,
    orderedItemId: String,
    shippedDetails : {
        address: String,
        pincode: String,
        city: String,
        state: String,
    },
}
const StockSchema = {
    Ghee: Number,
    Butter: Number
}

//Assigning schema to the collection
const Account = mongoose.model("Account", accountSchema)
const AdminDB = mongoose.model("Admin", adminSchema)
const AdminStock = mongoose.model("Stock", StockSchema)
const CartDB = mongoose.model("Cart", cartSchema)
const OrderDB = mongoose.model("Order", OrderSchema)
const store = new MongoDBSession({
    uri: MongoDBUri,
    collection: "adminSessions",
});
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static('public'))
app.use('/css',express.static(__dirname + 'public/css'))
app.use('/img',express.static(__dirname + 'public/img'))
app.use('/js',express.static(__dirname + 'public/js'))
app.use(session({
    secret: 'key that sign cookies',
    cookie:{
        maxAge: 10*60 * 1000,
    },
    resave: false, // for every request we want to create new session even if its same user
    saveUninitialized: false, // if we have not modified seesion we dont want it to save
    store: store,
}))
app.set('views', './views')
app.set('view engine', 'ejs')


const isAuth = (req, res, next) => {
    if(req.session.isAuth){
        next()
    }
    else{
        res.render('login',{
            error: ""
        })
    }
}



//Rendering Files
app.get('/', (req, res) => {
    return res.render('index',{
        url : req.session.user_profile,
        user: req.session.user,
    })
})

app.get('/product', (req, res) => {
    TotalItems = AdminStock.findOne((err, data)=>{
        return res.render('product',{
            url : req.session.user_profile,
            user: req.session.user,
            stock: data
        })
    }) 
    
})

app.get('/about', (req, res) => {
    return res.render('aboutus',{
        url : req.session.user_profile,
        user: req.session.user,
    })
})
app.get('/contact', (req, res) => {
    return res.render('contactus',{
        url : req.session.user_profile,
        user: req.session.user,
    })
})
app.get('/shop', (req, res) => {
    adminData = AdminDB.find((err, data)=>{
        return res.render('shop',{
            url : req.session.user_profile,
            user: req.session.user,
            objItem : data,
        })
    })
})
app.get('/cart', async(req, res) => {

    if(req.session.user == null){
        res.redirect('/login')
    }
    const adminData = await CartDB.find({username: req.session.user})
    if (adminData == null){ return res.render('cart',{
        url : req.session.user_profile,
        user: req.session.user,
        cartItem : []
    }) }
    return res.render('cart',{
        url : req.session.user_profile,
        user: req.session.user,
        cartItem : adminData,
        paid: 0,
    })

})
app.get('/login', (req, res) => {
    var error = req.query.error
    return res.render('login',{
        error : error,
    })
})
app.get('/signup', (req, res) => {
    return res.render('signup')
})

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if(err) throw err;
        return res.redirect('/')

    })
})
app.get('/admin', isAuth, (req, res) => {
    return res.render('admin',{
        status : 0
    })
})

app.get('/adminitem', (req, res) => {
    adminData = AdminDB.find((err, data)=>{
        return res.render('adminProduct',{
            url : req.session.user_profile,
            user: req.session.user,
            objItem : data
        })
    })
})

app.get('/stock', (req, res) =>{
    return res.render('stock',{
        status:0
    })
})

app.get('/delete', async (req, res)=>{
    var itemId = req.query.item_id;
    await AdminDB.deleteOne({_id : itemId});
    adminData = AdminDB.find((err, data)=>{
        return res.render('adminProduct',{
                objItem : data
            })
        })
})

app.get('/addcart', async (req,res)=>{
    var itemId = req.query.cart_id;
    if(req.session.user == null){
        return res.send("0")
    }
    AdminDB.find({_id:itemId},async(err, data)=>{
        if(!err){
            let newCart = new CartDB({
                username : req.session.user,
                category : data[0].category,
                quantity : data[0].quantity,
                amount : data[0].amount,
                productimg : data[0].productimg,
                productId: data[0]._id,
            })
            await newCart.save();
            return res.redirect('/shop');
        }
    });

})

app.get('/cartDelete', async (req,res)=>{
    var item_id = req.query.cart_id;
    const isDelete = await CartDB.deleteOne({_id : item_id}).clone();
    // var deleteData = JSON.stringify(isDelete);
   if(isDelete.deletedCount == 0) { return res.redirect('/cart'),{
    error: 'Please Try again later !'
   }}
   const adminData = await CartDB.find({username: req.session.user})
    return res.send(adminData);
})

app.get('/profile',(req,res)=>{
    return res.render('profile',{
        url : req.session.user_profile,
        userImg: req.session.user_profile,
        user: req.session.user,
        
    })
})

app.get('/orders', isAuth, async (req,res)=>{
    Item = await OrderDB.find({username: req.session.user});
    if(Item == null){ return res.render('orders',{
        orderItem: 0,
        url : req.session.user_profile,
        user: req.session.user,
    })}
    var orderItem = [];
    for(var i = 0; i<Item.length; i++)
    {
        productData = await AdminDB.findById({_id: Item[i].orderedItemId}) ;
        try{
        let eachdata  = {
            productimg: productData.productimg,
            category: productData.category,
            quantity: productData.quantity,
            amount: productData.amount,
            address: Item[i].shippedDetails.address,
            pincode: Item[i].shippedDetails.pincode,
            city: Item[i].shippedDetails.city,
            state: Item[i].shippedDetails.state,
        };
        orderItem.push(eachdata);
        }
        catch{

        }
    }
    return res.render('orders',{
        orderItem: orderItem,
        url : req.session.user_profile,
        user: req.session.user,
    })
});



// REGISTER - Registering new user
app.post("/signup", async function(req,res){
    const {username, password} = req.body;
    let user = await Account.findOne({username});
    if(user){
        return res.redirect('/signup');
    }
    const hashedPwd = await bcrypt.hash(password, 12) // 12 is salt , salt will just make it more random
    user = new Account({
      username,
      password : hashedPwd,
      profile : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrM9idjLIZhIs-ZGvkIef0hWJbgOiReywmVg&usqp=CAU",

    });
    await user.save();
    return res.redirect("/login");
})

// LOGIN - Validating Existing user
app.post("/login", async function(req,res){
    const {username, password} = req.body;
    const user = await Account.findOne({username});
    if(user == null){
        return res.render('login',{
            error:"Account not found"
        })
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        return res.render('login',{
            error: 'Password doesn\'t match  !',
        });
    }
    if(user.username == "admin"){
        req.session.isAuth = true;
        req.session.user = username;
        req.session.user_porfile = user.profile;
        return res.redirect('/admin')
    }
    req.session.isAuth = true;
    req.session.user = username;
    req.session.user_profile = user.profile;
    return res.redirect('/');

})

app.post("/admin", function(req,res){
    var cate = req.body.Category;
    var quant;
    var amt = req.body.Amount ;
    var img = req.body.img;
    if (req.body.GQuantity != 'none'){
        quant = req.body.GQuantity;
    }
    else{
        quant = req.body.BQuantity;
    }
    let adminData = new AdminDB({
        category : cate,
        quantity : quant,
        amount : amt,
        productimg : img,
    });
    adminData.save();
    return res.render('admin',{
        status : 1
    });
});

//admin stock
app.post('/stock',async function(req, res){
    PostData = req.body;
    await AdminStock.deleteMany({});
    let insertStock = new AdminStock({
        Ghee : PostData.stockGhee,
        Butter: PostData.stockButter
    });
    insertStock.save();
    return res.render('stock',{
    status : 1
});
})
//admin logout
app.post('/adminLogout', (req, res)=>{
    req.session.destroy((err) => {
        if(err) throw err;
        return res.redirect('/')

    })
})

// updating user profiles
app.post('/updateprofile', async function(req, res){
    var url = req.body.url;
    var name = req.body.username;
    await Account.updateOne({username: name},{$set: {"profile": url}})
    req.session.user = name,
    req.session.user_profile = url
    return res.render('profile',{
        url: url,
        userImg: url,
        user: req.session.user,
    })
})


app.post('/pay', function(req, res){
    const {cartId, cartAmount, cartCategory, cartQuantity, productId} = req.body;
	res.render('pay', {
    cartId: cartId,
    cartAmount: cartAmount,
    cartCategory: cartCategory,
    cartQuantity: cartQuantity,
    productId: productId,
	key: Publishable_Key
	})
})

//payment 
app.post('/payment',async function(req, res){

	// Moreover you can take more details from user
	// like Address, Name, etc from form
    const {cartId, cartAmount, cartCategory, cartQuantity, productId} = req.body;
    const {name, address1, pincode, city, state} = req.body; 
	stripe.customers.create({
		email: req.body.stripeEmail,
		source: req.body.stripeToken,
		name: name,
		address: {
			line1: address1,
			postal_code: pincode,
			city: city,
			state: state,
		}
	})
	.then((customer) => {

		return stripe.charges.create({
			amount: cartAmount * 100,	
			description: cartCategory +","+cartQuantity ,
			currency: 'INR',
			customer: customer.id
		});
	})
	.then(async(charge) => {
        // console.log("Charge ",charge);
        await CartDB.deleteOne({_id : cartId}).clone();
        if (cartCategory == 'ghee')
        {
            await AdminStock.findOneAndUpdate({},{$inc: {'Ghee': -1}});
        }
        if (cartCategory == 'butter')
        {
            await AdminStock.findOneAndUpdate({},{$inc: {'Butter': -1}});
        }
        productData = await AdminDB.findOne({_id: cartId})
        order = new OrderDB({
            username: req.session.user,
            orderedItemId: productId,
            shippedDetails:{
                address: address1,
                pincode: pincode,
		    	city: city,
			    state: state,

            }
        });
        await order.save();
		const adminData = await CartDB.find({username: req.session.user})
        return res.render('cart',{
        url : req.session.user_profile,
        user: req.session.user,
        cartItem : adminData,
        paid: 1,
    }) // If no error occurs
	})
	.catch((err) => {
		res.send(err)	 // If some error occurs
	});
})



app.listen(port, function(err){
    if(err) throw err; 
    console.info(`I somewhat done push-ups on ${port}`) 
});

