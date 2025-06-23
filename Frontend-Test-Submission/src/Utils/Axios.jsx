import axios from "axios";

const Axios = axios.create({
    baseURL:
        "http://localhost:8000/api",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

export default Axios;
