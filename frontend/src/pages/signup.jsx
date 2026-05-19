import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleSignup = async () => {

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/signup`,
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

    if (data.message) {

      navigate("/");

    } else {

      alert(data.error);

    }

  };

  return (

    <div className="min-h-screen bg-black text-white flex items-center justify-center">

      <div className="bg-zinc-950 border border-zinc-800 p-10 rounded-[2rem] w-full max-w-md">

        <h1 className="text-4xl font-black mb-8">
          Signup ✨
        </h1>

        <input
          type="text"
          placeholder="Username"
          className="w-full mb-4 p-4 rounded-xl bg-zinc-900 border border-zinc-800"
          onChange={(e) =>
            setForm({
              ...form,
              username: e.target.value,
            })
          }
        />

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
          onClick={handleSignup}
          className="w-full bg-fuchsia-500 text-white font-bold py-4 rounded-xl"
        >
          Create Account
        </button>

        <p className="mt-6 text-zinc-400">

          Already have an account?{" "}

          <Link
            to="/"
            className="text-cyan-400"
          >
            Login
          </Link>

        </p>

      </div>

    </div>

  );

}