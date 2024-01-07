'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { redirectToSpotifyLogin } from "../utils"; 
import { SPOTIFY_REDIRECT } from "../constants/links";
import SearchArtist from "./SearchArtist";

interface HashParamsType {
  [key: string]: string | undefined;
}

export default function Callback() {
  const [requestToken, setRequestToken] = useState<string | undefined>('')

  useEffect(() => {
    let hashParams: HashParamsType = {};
    let e: RegExpExecArray | null,
      r = /([^&;=]+)=?([^&;]*)/g,
      q = window.location.hash.substring(1);
    while ((e = r.exec(q))) {
      hashParams[e[1]] = decodeURIComponent(e[2]);
    }

    if (!hashParams.access_token && requestToken) {
      redirectToSpotifyLogin(SPOTIFY_REDIRECT);
    } else {
      setRequestToken(hashParams.access_token);
    }
  }, [requestToken]);

  return (
    <main>
      <Link href="/">Home</Link>

      <SearchArtist requestToken={requestToken} />
    </main>
  )
}