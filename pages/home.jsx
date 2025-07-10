import styles from  "../styles/home.module.css"
import UserNavbar from "../components/userNavbar";
import Footer from "../components/footer";
import Feed from "../components/feed";
import { requestNotificationPermission } from "../utils/useSubscribeNotification"

const Home = () => {
    return(<div className="homeInterface">
  
        <UserNavbar/>
 <Feed/>
        <Footer/>
    </div>)
}

export default Home;