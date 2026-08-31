import { useEffect, useState } from "react"
import { index } from '../services/user'

const Dashboard = (props) => {

    const [allUsers, setAllUsers] = useState([])

    useEffect(() => {
        const fetchUsers = async () => {
            const usersData =  await index()
            setAllUsers(usersData)
        }
        fetchUsers()
        
    }, [])

    return (
        <section>
            <header>
                <h1>Welcome {props.user.username}!</h1>
                <h2>View All the Users</h2>
            </header>
            {allUsers.map((user) => (
                <div className="card">
                    <header>
                        <h1>
                        {user.username}
                        </h1>
                    </header>
                </div>
            ))}
        </section>
    )
}

export default Dashboard