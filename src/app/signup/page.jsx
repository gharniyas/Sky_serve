"use client";

import UserPassword from "@/components/UserPassword";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios from "axios";

const SignUp = () => {
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post("/api/register", data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log(" response", data);
      if (data.success == true) {
        router.push("/");
      }
    },
    onError: (error) => {
      console.error("Error during registration:", error);
    },
  });

  const Submit = (data) => {
    mutation.mutate(data);
  };

  return (
    <>
      <h2 className="mb-4 text-2xl font-bold text-center">Sign Up</h2>
      <UserPassword type="Sign up" Submit={Submit} />
    </>
  );
};

export default SignUp;
