import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import "./App.css";
import {
  getAuth,
  GoogleAuthProvider,
  inMemoryPersistence,
  signInWithPopup,
} from "firebase/auth";
import { app } from "./config/firebase_config";
import { getAllSongs, validateUser } from "./api";
import {
  Dashboard,
  Home,
  Loader,
  Login,
  Register,
  MusicPlayer,
  UserProfile,
} from "./components";
import { useStateValue } from "./Context/StateProvider";
import { actionType } from "./Context/reducer";
import { motion, AnimatePresence } from "framer-motion";

function App() {
  const [currentForm, setCurrentForm] = useState("login");

  const toggleForm = (formName) => {
    setCurrentForm(formName);
  };

  const firebaseAuth = getAuth(app);
  const navigate = useNavigate();
  const [{ user, allSongs, song, isSongPlaying, miniPlayer }, dispatch] =
    useStateValue();
  const [isLoading, setIsLoading] = useState(false);

  const [auth, setAuth] = useState(
    false || window.localStorage.getItem("auth") === "true"
  );

  const location = useLocation();

  useEffect(() => {
    setIsLoading(true);
    firebaseAuth.onAuthStateChanged((userCred) => {
      if (userCred) {
        userCred.getIdToken().then((token) => {
          // console.log(token);
          window.localStorage.setItem("auth", "true");
          validateUser(token).then((data) => {
            dispatch({
              type: actionType.SET_USER,
              user: data,
            });
          });
        });
        setIsLoading(false);
      } else {
        setAuth(false);
        dispatch({
          type: actionType.SET_USER,
          user: null,
        });
        setIsLoading(false);
        window.localStorage.setItem("auth", "false");
        navigate("/login");
      }
    });
  }, []);

  useEffect(() => {
    if (!allSongs && user) {
      getAllSongs().then((data) => {
        dispatch({
          type: actionType.SET_ALL_SONGS,
          allSongs: data.data,
        });
      });
    }
  }, []);

  return (
    <AnimatePresence>
      <div
        style={
          location.pathname !== "/login"
            ? {
                height: "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: "680px",
              }
            : {}
        }
      >
        {/* {isLoading ||
          (!user && (
            <div
              style={{
                position: "fixed",
                top: "0",
                right: "0",
                bottom: "0",
                left: "0",
                backgroundColor: "#00000099",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Loader />
            </div>
          ))} */}
        <Routes>
          <Route
            path="/login"
            element={
              currentForm === "login" ? (
                <Login setAuth={setAuth} onFormSwitch={toggleForm} />
              ) : (
                <Register setAuth={setAuth} onFormSwitch={toggleForm} />
              )
            }
          />
          <Route path="/*" element={<Home />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="/userProfile" element={<UserProfile />} />
        </Routes>
        {isSongPlaying && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            style={{
              position: "fixed",
              minWidth: "700px",
              height: "6.5rem",
              left: "0",
              right: "0",
              bottom: "0",
              backgroundColor: "#1f2937",
              boxShadow: "0 0.25rem 0.5rem rgba(0, 0, 0, 0.2)",
            }}
            className={`fixed min-w-[700px] h-26  inset-x-0 bottom-0  bg-cardOverlay drop-shadow-2xl backdrop-blur-md flex items-center justify-center`}
          >
            <MusicPlayer />
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
}

export default App;
