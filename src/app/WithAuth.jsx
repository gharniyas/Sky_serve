"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCookies } from "react-cookie";

const withProtectedRoute = (WrappedComponent) => {
  const ProtectedRoute = (props) => {
    const router = useRouter();
    const [isAuth, setIsAuth] = useState(false);
    const [cookies] = useCookies();

    useEffect(() => {
      const token = cookies.token;
      if (token) {
        setIsAuth(true);
      } else {
        router.push("/login");
      }
    }, [router, cookies]);

    if (!isAuth) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  return ProtectedRoute;
};

export default withProtectedRoute;
