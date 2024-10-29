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
  };
  return (
    <div className="flex items-center justify-between px-2 py-2">
      <FileUploadForm refetch={refetch} />
      <div className="flex gap-8 p-4 items-center">
        <div className="flex flex-col items-center">
          <FaRegUserCircle size={30} />
          <div>{cookies?.username}</div>
        </div>
        {cookies.token ? <Button onClick={handleLogout}>logout</Button> : <></>}
      </div>
    </div>
  );
};

export default Header;
