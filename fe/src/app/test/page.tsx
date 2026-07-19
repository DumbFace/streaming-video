'use client'
import { Button } from "@/src/components/ui/button";
import { useState } from "react";


export default function TestPage() {
    const [text, useText] = useState<string>("");


    const onGet = () => {
        fetch("https://api.dumbface.org/").then(response => {
            console.log(response);
        })
    }

    const onPost = () => {
        const data = {
            firstName: "Kang",
            lastName: "Pham",
        }
        fetch("https://api.dumbface.org/", {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
            },
            // credentials: "include",
        }).then(response => {
            console.log(response);
        })
    }


    const onPut = () => {
        const data = {
            firstName: "Kang",
            lastName: "Pham",
        }
        fetch("https://api.dumbface.org/", {
            method: "PUT",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
                "X-Force-Preflight": "true",
            },
            // credentials: "include",
        }).then(response => {
            console.log(response);
        })
    }

    return (
        <>
            <Button onClick={onGet}>On Get</Button>

            <Button onClick={onPost}>On Post</Button>

            <Button onClick={onPut}>On Put</Button>

        </>

    )
}