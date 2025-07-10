import Navbar from "../components/navbar"
import Feed from "../components/feed"
import Footer from "../components/footer"
const Dashboard = () => {
    return(<div className="container">
        <Navbar/>
        <div className="area">
 <Feed/>
<Footer/>
        </div>
    </div>)
}
export default Dashboard