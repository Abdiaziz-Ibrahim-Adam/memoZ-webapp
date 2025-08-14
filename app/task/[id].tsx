// app/task/[id].tsx
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { db } from "../../lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";

const UI = { bg: "#F7F8FD", text: "#0B0F18", border: "#E5E7EB", white: "#fff", primary: "#7C3AED", muted:"#6B7280" };

export default function EditTask() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<"low"|"medium"|"high">("low");
  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  useEffect(() => {
    (async () => {
      const ref = doc(db, "tasks", String(id));
      const s = await getDoc(ref);
      if (!s.exists()) { Alert.alert("Task not found"); router.back(); return; }
      const d = s.data() as any;
      setTitle(d.title || "");
      setPriority(d.priority || "low");
      setDate(d.startsAt?.toDate?.() ?? new Date(d.startsAt || Date.now()));
    })().catch(console.warn);
  }, [id]);

  const save = async () => {
    if (!title.trim()) return Alert.alert("Task", "Enter a title.");
    const ref = doc(db, "tasks", String(id));
    await updateDoc(ref, { title: title.trim(), priority, startsAt: Timestamp.fromDate(date), updatedAt: Timestamp.now() });
    router.back();
  };

  const remove = async () => {
    Alert.alert("Delete task?", "This can’t be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { await deleteDoc(doc(db, "tasks", String(id))); router.back(); } }
    ]);
  };

  return (
    <View style={{ flex:1, backgroundColor: UI.bg }}>
      <View style={{ height:56, alignItems:"center", justifyContent:"center", borderBottomWidth:1, borderBottomColor:UI.border, backgroundColor:UI.white }}>
        <Text style={{ fontSize:18, fontWeight:"800", color:UI.text }}>Edit Task</Text>
      </View>

      <View style={{ padding:16 }}>
        <View style={{ backgroundColor:UI.white, borderWidth:1, borderColor:UI.border, borderRadius:16, padding:12, marginBottom:12 }}>
          <Text style={{ color:UI.muted, marginBottom:6 }}>Title</Text>
          <TextInput value={title} onChangeText={setTitle} placeholder="Task title" placeholderTextColor="#9ca3af" style={{ fontSize:16, color:UI.text }} />
        </View>

        {/* Priority pills */}
        <View style={{ flexDirection:"row", gap:10, marginBottom:12 }}>
          {(["low","medium","high"] as const).map(p => {
            const active = priority === p;
            const bg = active ? (p==="high"?"#FEE2E2":p==="medium"?"#FEF3C7":"#E0E7FF") : UI.white;
            const br = active ? (p==="high"?"#FCA5A5":p==="medium"?"#FDE68A":"#A5B4FC") : UI.border;
            return (
              <TouchableOpacity key={p} onPress={()=>setPriority(p)} style={{ paddingVertical:10, paddingHorizontal:16, borderRadius:999, backgroundColor:bg, borderWidth:2, borderColor:br }}>
                <Text style={{ fontWeight:"800", color:UI.text }}>{p[0].toUpperCase()+p.slice(1)}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Date/time */}
        <View style={{ flexDirection:"row", gap:10, marginBottom:12 }}>
          <TouchableOpacity onPress={()=>setShowDate(true)} style={{ flex:1, backgroundColor:UI.white, borderWidth:1, borderColor:UI.border, borderRadius:12, padding:12, alignItems:"center" }}>
            <Text style={{ fontSize:12, color:UI.muted, marginBottom:4 }}>DATE</Text>
            <Text style={{ fontSize:16, fontWeight:"800", color:UI.text }}>{format(date, "MMM d, yyyy")}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>setShowTime(true)} style={{ flex:1, backgroundColor:UI.white, borderWidth:1, borderColor:UI.border, borderRadius:12, padding:12, alignItems:"center" }}>
            <Text style={{ fontSize:12, color:UI.muted, marginBottom:4 }}>TIME</Text>
            <Text style={{ fontSize:16, fontWeight:"800", color:UI.text }}>{format(date, "HH:mm")}</Text>
          </TouchableOpacity>
        </View>

        {showDate && <DateTimePicker mode="date" value={date} onChange={(_,d)=>{ setShowDate(Platform.OS==="android"?false:true); if(d) setDate(prev=>new Date(d.setHours(prev.getHours(),prev.getMinutes(),0,0))); }} />}
        {showTime && <DateTimePicker mode="time" value={date} onChange={(_,d)=>{ setShowTime(Platform.OS==="android"?false:true); if(d) setDate(prev=>{ const n=new Date(prev); n.setHours(d.getHours(), d.getMinutes(),0,0); return n; }); }} />}

        <TouchableOpacity onPress={save} style={{ backgroundColor:UI.primary, paddingVertical:14, borderRadius:12, alignItems:"center", marginTop:4 }}>
          <Text style={{ color:"#fff", fontWeight:"900" }}>Save Changes</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={remove} style={{ paddingVertical:14, borderRadius:12, alignItems:"center", marginTop:10, borderWidth:1, borderColor:"#FCA5A5", backgroundColor:"#FFF1F2" }}>
          <Text style={{ color:"#B91C1C", fontWeight:"900" }}>Delete Task</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
