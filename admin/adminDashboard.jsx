import Navbar from "../components/navbar"
import Feed from "../components/feed"
const Dashboard = () => {
    return(<div className="container">
        <Navbar/>
        <div className="area">
 <Feed/>
        </div>
    </div>)
}
export default Dashboard