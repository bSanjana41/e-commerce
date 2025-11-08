import connectDb from "./config/db.js"
import app from "./index.js";

const connectServer=async()=>{
    await connectDb()
    try {
        app.listen(process.env.PORT,()=>{
            console.log(`Server is running on port http://localhost:${process.env.PORT}`);
        })

    } catch (err) {
        console.log("Error in server connection",err);
    }
}
export default connectServer;