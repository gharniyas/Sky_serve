"use client";
import { useForm, Controller } from "react-hook-form";
import { Input } from "antd";
import Link from "next/link";

const UserPassword = ({ type, Submit, loading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm({
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (data) => {
    Submit(data);
    reset();
  };

  return (
    <div className="flex justify-center h-full items-center">
      <div className="bg-gray-100 p-8 rounded-lg">
        <div className="flex flex-col justify-center">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium">Username</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                placeholder="Enter Username"
                {...register("username", {
                  required: "Enter Username!",
                })}
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-1 flex justify-start">
                  {errors.username.message}
                </p>
              )}
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">Email</label>
              <input
                type="email"
                className="w-full p-2 border rounded"
                placeholder="Enter Email"
                {...register("email", {
                  required: "Enter Email!",
                })}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 flex justify-start">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium">Password</label>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Input.Password
                    {...field}
                    placeholder="Password"
                    className="p-2"
                    autoComplete="true"
                  />
                )}
                rules={{ required: "Enter Password!" }}
              />
              {errors.password && (
                <p className="text-red-600 text-xs mt-1 flex justify-start">
                  {errors.password.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="w-full p-2 mt-4 font-bold text-white bg-blue-500 rounded hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? "Loading..." : type}
            </button>
          </form>
          <div className="p-4">
            {type === "Login" ? (
              <>Don&apos;t have an account? </>
            ) : (
              <>Already have an account? </>
            )}
            <Link
              href={type === "Login" ? "/signup" : "/login"}
              className="underline text-blue-400"
            >
              {type === "Login" ? "Sign Up" : "Login"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPassword;
