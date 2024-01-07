'use client';

import { useEffect } from "react";
import { SPOTIFY_REDIRECT } from "../constants/links";
import { redirectToSpotifyLogin } from "../utils";

interface HashParamsType {
  [key: string]: string | undefined;
}

export default function Login() {
  useEffect(() => {

    let hashParams: HashParamsType = {};
    let e: RegExpExecArray | null,
      r = /([^&;=]+)=?([^&;]*)/g,
      q = window.location.hash.substring(1);
    while ((e = r.exec(q)) !== null) {
      hashParams[e[1]] = decodeURIComponent(e[2]);
    }

    if (!hashParams.access_token) {
      redirectToSpotifyLogin(SPOTIFY_REDIRECT);
    }
  }, []);

  return(
    <div className="loginBox">
      <p>Loading Spotify Login...</p>
    </div>
  )
}