"use client";
import { FaRegUserCircle } from "react-icons/fa";
import { useCookies } from "react-cookie";
import React from "react";
import FileUploadForm from "@/components/FileUploadForm";
import { Button } from "antd";
const Header = (refetch) => {
  const [cookies, setCookie, removeCookie] = useCookies();
  const handleLogout = () => {
    removeCookie("username");
    removeCookie("token");
    removeCookie("userId");
  };
  return (
    <div className="flex items-center justify-between px-2 py-2">
      <FileUploadForm refetch={refetch} />
      <div className="flex  md:flex-row flex-col gap-8 p-4 items-center px-2">
        <div className="flex flex-col items-center">
          <FaRegUserCircle size={window.innerWidth < 640 ? 20 : 30} />
          <div>{cookies?.username}</div>
        </div>
        {cookies.token ? <Button onClick={handleLogout}>Logout</Button> : null}
      </div>
    </div>
  );
};

export default Header;
