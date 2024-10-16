import { Link } from "react-router-dom"
import forgotpwd from "../../assets/buyer/forgot_password.png"

export default function ForgotForm(){
    return(
        <>
            <form className="rounded flex flex-wrap flex-1 bg-white px-4 ">
                <div>
                    <div className="text-center">
                        <div className="flex justify-center">
                            <img src={forgotpwd} className=""></img>
                        </div>
                        <h1 className="text-[26px] font-semibold py-2">
                            Forgot Password</h1>
                    </div>
                    <label className="text-[18px]">Email</label>
                    <div className="grid relative h-[52.5px] border-2 border-slate-300 rounded justify-between items-center px-2 mt-2">
                        <input className="" placeholder="Enter Email ID"></input>
                        
                    </div>
                    <div className="grid ">
                        <button type="submit" className="w-full bg-orangeButton text-white px-w py-3 my-6 rounded">Send</button>
                        <Link className="text-center mb-6">Reset via OTP</Link>
                    </div>
                   
                </div>
            </form>
        </>
    )
}   