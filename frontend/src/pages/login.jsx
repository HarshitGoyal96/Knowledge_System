import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleLogin = async () => {

    const response = await fetch(
      "http://127.0.0.1:8000/login",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(form),
      }
    );

    const data = await response.json();

    if (data.access_token) {

      localStorage.setItem(
        "token",
        data.access_token
      );

      navigate("/dashboard");

    } else {

      alert(data.error);

    }

  };

  return (

    <div className="min-h-screen bg-black text-white flex items-center justify-center">

      <div className="bg-zinc-950 border border-zinc-800 p-10 rounded-[2rem] w-full max-w-md">

        <h1 className="text-4xl font-black mb-8">
          Login 🚀
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-4 rounded-xl bg-zinc-900 border border-zinc-800"
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value,
            })
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-6 p-4 rounded-xl bg-zinc-900 border border-zinc-800"
          onChange={(e) =>
            setForm({
              ...form,
              password: e.target.value,
            })
          }
        />

        <button
          onClick={handleLogin}
          className="w-full bg-cyan-400 text-black font-bold py-4 rounded-xl"
        >
          Login
        </button>

        <p className="mt-6 text-zinc-400">

          Don't have an account?{" "}

          <Link
            to="/signup"
            className="text-cyan-400"
          >
            Signup
          </Link>

        </p>

      </div>

    </div>

  );

}