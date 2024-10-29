"use client";
import { useMutation } from "@tanstack/react-query";
import UserPassword from "@/components/UserPassword";
import { useRouter } from "next/navigation";
import { useCookies } from "react-cookie";
import axios from "axios";
const Login = () => {
  const router = useRouter();
  const [cookies, setCookie] = useCookies([]);
  const mutation = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post("/api/login", data);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success == false) {
        alert(data.message);
      }
      if (data.success == true) {
        setCookie("token", data.token, { maxAge: 60 * 60 * 60 });
        setCookie("username", data.datas.username, { maxAge: 60 * 60 * 60 });
        setCookie("userId", data.datas._id.toString());
        router.push("/");
      }
    },
    onError: (error) => {
      console.error("Error during login:", error);
    },
  });

  const Submit = (data) => {
    mutation.mutate(data);
  };

  return (
    <>
      <h2 className="mb-4 text-2xl font-bold text-center">Login</h2>

      <UserPassword type={"Login"} Submit={Submit} />
    </>
  );
};

export default Login;
