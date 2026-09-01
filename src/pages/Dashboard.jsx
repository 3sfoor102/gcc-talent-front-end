import { useEffect, useState } from "react";
import { index } from "../services/user-service";

const Dashboard = (props) => {
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      // const usersData = await index();
      // setAllUsers(usersData);
    };
    fetchUsers();
  }, []);

  return <section></section>;
};

export default Dashboard;
