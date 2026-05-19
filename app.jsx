import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, onSnapshot } from "firebase/firestore";

// 🔥 CONFIGURA AQUÍ TU FIREBASE (te explico abajo)
const firebaseConfig = {

  apiKey: "AIzaSyA63bwkcyaQ3NLFINvinscfRurJH61_TFA",

  authDomain: "jornadas-embrazadas.firebaseapp.com",

  projectId: "jornadas-embrazadas",

  storageBucket: "jornadas-embrazadas.firebasestorage.app",

  messagingSenderId: "787676135101",

  appId: "1:787676135101:web:5b37ac03da9000eaf481d4",

  measurementId: "G-P2J6CCYF0J"

};



const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function App() {
  const [user, setUser] = useState(null);
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  const [pacientes, setPacientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    edad: "",
    localidad: "",
    jornada1: false,
    jornada2: false,
    estado: "EMBARAZADA",
    recienNacido: { nombre: "", peso: "" }
  });

  // 🔄 ESCUCHAR DATOS EN TIEMPO REAL
  useEffect(() => {
    if (!user) return;

    const unsub = onSnapshot(collection(db, "pacientes"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPacientes(data);
    });

    return () => unsub();
  }, [user]);

  const login = async () => {
    try {
      const res = await signInWithEmailAndPassword(auth, loginData.email, loginData.password);
      setUser(res.user);
    } catch (err) {
      alert("Error login");
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const guardar = async () => {
    await addDoc(collection(db, "pacientes"), form);
    alert("Guardado en la nube ✅");
  };

  const filtrados = pacientes.filter(p =>
    (p.nombre || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  if (!user) {
    return (
      <div style={{ textAlign: "center", padding: 50 }}>
        <h1>🔐 Login Sistema</h1>
        <input placeholder="Correo" onChange={(e)=>setLoginData({...loginData,email:e.target.value})}/><br/>
        <input type="password" placeholder="Contraseña" onChange={(e)=>setLoginData({...loginData,password:e.target.value})}/><br/>
        <button onClick={login}>Entrar</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>🩺 Plataforma Embarazadas (Firebase)</h1>
      <button onClick={logout}>Cerrar sesión</button>

      <h2>📋 Registro</h2>
      <input placeholder="Nombre" onChange={(e)=>setForm({...form,nombre:e.target.value})}/>
      <input placeholder="Edad" onChange={(e)=>setForm({...form,edad:e.target.value})}/>
      <input placeholder="Localidad" onChange={(e)=>setForm({...form,localidad:e.target.value})}/>

      <label>
        <input type="checkbox" onChange={(e)=>setForm({...form,jornada1:e.target.checked})}/> Jornada 1
      </label>
      <label>
        <input type="checkbox" onChange={(e)=>setForm({...form,jornada2:e.target.checked})}/> Jornada 2
      </label>

      <select onChange={(e)=>setForm({...form,estado:e.target.value})}>
        <option>EMBARAZADA</option>
        <option>PUERPERA</option>
      </select>

      {form.estado === "PUERPERA" && (
        <div>
          <h3>👶 Recién Nacido</h3>
          <input placeholder="Nombre RN" onChange={(e)=>setForm({...form,recienNacido:{...form.recienNacido,nombre:e.target.value}})}/>
          <input placeholder="Peso" onChange={(e)=>setForm({...form,recienNacido:{...form.recienNacido,peso:e.target.value}})}/>
        </div>
      )}

      <button onClick={guardar}>Guardar en la nube</button>

      <h2>🔎 Pacientes</h2>
      <input placeholder="Buscar" onChange={(e)=>setBusqueda(e.target.value)}/>

      {filtrados.map(p => (
        <div key={p.id} style={{ border:"1px solid #ccc", margin:10, padding:10}}>
          <h3>{p.nombre}</h3>
          <p>{p.edad} años</p>
          <p>{p.localidad}</p>
          <p>J1: {p.jornada1 ? "✔" : "✘"} | J2: {p.jornada2 ? "✔" : "✘"}</p>
          {p.estado === "PUERPERA" && (
            <p>RN: {p.recienNacido?.nombre} - {p.recienNacido?.peso}kg</p>
          )}
        </div>
      ))}
    </div>
  );
}
