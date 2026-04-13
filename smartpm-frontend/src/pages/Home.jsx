import { useEffect, useState } from "react";
import { getProjects } from "../api/projectApi";
import ProjectForm from "../components/ProjectForm";
import ProjectList from "../components/ProjectList";

export default function Home({ user, onLogout }) {
  const [projects, setProjects] = useState([]);

  const loadProjects = async () => {
    const res = await getProjects();
    setProjects(res.data);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <div className="page">

      {/* Animated background */}
      <div className="background">
        <span className="blob b1"></span>
        <span className="blob b2"></span>
        <span className="blob b3"></span>
      </div>

      {/* Content */}
      <div className="container">
        <div className="topbar">
          <div>
            <h1 className="title">Smart PM (Team 5)</h1>
            <h5 className="subtitle1">Welcome back, {user?.username}</h5>
          </div>
          <button className="logout" onClick={onLogout}>
            Logout
          </button>
        </div>

        <p className="subtitle">
          Manage projects, specs, and AI-generated artifacts
        </p>

        <div className="card">
          <ProjectForm refresh={loadProjects} />
        </div>

        <div className="card">
          <ProjectList projects={projects} refresh={loadProjects} />
        </div>
      </div>

      {/* CSS */}
      <style>{`
        .page {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          overflow: hidden;
          background: #0b1020;
          padding: 40px 20px;
        }

        /* BACKGROUND LAYER */
        .background {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          overflow: hidden;
          z-index: 0;
        }

        .blob {
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.6;
          animation: float 7s infinite ease-in-out;
        }

        .b1 {
          background: #3b82f6;
          top: 10%;
          left: 20%;
          animation-delay: 0s;
        }

        .b2 {
          background: #8b5cf6;
          bottom: 10%;
          right: 20%;
          animation-delay: 3s;
        }

        .b3 {
          background: #06b6d4;
          top: 60%;
          left: 60%;
          animation-delay: 6s;
        }

        @keyframes float {
          0% {
            transform: translateY(0px) translateX(0px) scale(1);
          }
          50% {
            transform: translateY(-40px) translateX(30px) scale(1.1);
          }
          100% {
            transform: translateY(0px) translateX(0px) scale(1);
          }
        }

        /* CONTENT */
        .container {
          width: 100%;
          max-width: 800px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          z-index: 1;
        }

        .title {
          text-align: center;
          color: white;
          font-size: 38px;
          margin-bottom: 3px;
        }

        .subtitle {
          text-align: center;
          color: #94a3b8;
          margin-bottom: 10px;
          margin-top: 0px;
        }
        .subtitle1 {
          text-align: left;
          color: #94a3b8;
          margin: 0px;
        }
        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 12px;
        }
        .logout {
          border: none;
          border-radius: 12px;
          padding: 12px 18px;
          background: #ef4444;
          color: #fff;
          cursor: pointer;
          font-weight: 700;
        }

        .card {
          background: rgba(17, 24, 39, 0.85);
          backdrop-filter: blur(10px);
          padding: 20px;
          border-radius: 14px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.4);
        }
      `}</style>
    </div>
  );
}