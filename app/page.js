import AnimatedMesh from "./components/AnimatedMesh"
import LoginForm from "./components/LoginForm"

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030417] text-slate-100 relative overflow-hidden">
      <AnimatedMesh />
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#020317]/80 via-[#041230]/60 to-[#030417]/90"></div>
      </div>

      <main className="w-full flex items-center justify-center">
        <LoginForm />
      </main>
    </div>
  )
}
