"use server";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import classes from "../utils/styles.module.css";
import MainMaps from "@/components/main-maps";

export default async function Home() {
  return (
    <div className={classes.mainContainer}>
      <MainMaps />
    </div>
  );
}
