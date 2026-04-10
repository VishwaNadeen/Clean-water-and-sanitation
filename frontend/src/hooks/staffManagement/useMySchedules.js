import { useEffect, useMemo, useState } from "react";
import {
  completeWork,
  getMySchedules,
  removeProof,
  reworkRejectedTask,
  revertStartWork,
  startWork,
  uploadProof,
} from "../../services/staffManagementService";

const ACTIVE_STATUSES = ["Assigned", "InProgress"];
const TOAST_DURATION_MS = 5000;

const getScheduleDateTime = (schedule) => {
  const date = new Date(schedule?.date);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const [hours = "0", minutes = "0"] = String(schedule?.startTime || "00:00").split(":");
  date.setHours(Number(hours) || 0, Number(minutes) || 0, 0, 0);

  return date;
};

const getAssignedSortTime = (schedule) => {
  return new Date(
    schedule?.createdAt || schedule?.updatedAt || schedule?.date || 0
  ).getTime();
};

const isSameDay = (left, right) => {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
};

const getStartOfWeek = (date) => {
  const value = new Date(date);
  const day = value.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  value.setDate(value.getDate() + diff);
  value.setHours(0, 0, 0, 0);
  return value;
};

const getEndOfWeek = (date) => {
  const value = getStartOfWeek(date);
  value.setDate(value.getDate() + 6);
  value.setHours(23, 59, 59, 999);
  return value;
};

const useMySchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState("");
  const [filter, setFilter] = useState("All");
  const [timeFilter, setTimeFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [proofFiles, setProofFiles] = useState({});
  const [formState, setFormState] = useState({});
  const [message, setMessage] = useState({ type: "", text: "" });
  const [proofMessageById, setProofMessageById] = useState({});
  const [taskMessageById, setTaskMessageById] = useState({});

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage({ type: "", text: "" });
    }, TOAST_DURATION_MS);
  };

  const showProofMessage = (id, type, text) => {
    if (!id) {
      return;
    }

    setProofMessageById((prev) => ({
      ...prev,
      [id]: { type, text },
    }));

    setTimeout(() => {
      setProofMessageById((prev) => {
        if (!prev[id]) {
          return prev;
        }

        const next = { ...prev };
        delete next[id];
        return next;
      });
    }, TOAST_DURATION_MS);
  };

  const showTaskMessage = (id, type, text) => {
    if (!id) {
      return;
    }

    setTaskMessageById((prev) => ({
      ...prev,
      [id]: { type, text },
    }));

    setTimeout(() => {
      setTaskMessageById((prev) => {
        if (!prev[id]) {
          return prev;
        }

        const next = { ...prev };
        delete next[id];
        return next;
      });
    }, TOAST_DURATION_MS);
  };

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const data = await getMySchedules();
      const scheduleList = Array.isArray(data) ? data : [];
      setSchedules(scheduleList);

      const initialForm = {};
      scheduleList.forEach((item) => {
        initialForm[item._id] = {
          staffNote: item.staffNote || "",
          materialsUsed: item.materialsUsed || "",
          issuesFound: item.issuesFound || "",
        };
      });
      setFormState(initialForm);
    } catch (error) {
      showMessage("error", error?.response?.data?.message || "Failed to load schedules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  const filteredSchedules = useMemo(() => {
    let list = [...schedules];
    const now = new Date();
    const startOfWeek = getStartOfWeek(now);
    const endOfWeek = getEndOfWeek(now);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    if (filter !== "All") {
      list = list.filter((item) => item.status === filter);
    }

    if (timeFilter !== "All") {
      list = list.filter((item) => {
        const scheduleDate = new Date(item.date);
        if (Number.isNaN(scheduleDate.getTime())) {
          return false;
        }

        if (timeFilter === "Today") {
          return isSameDay(scheduleDate, now);
        }

        if (timeFilter === "This Week") {
          return scheduleDate >= startOfWeek && scheduleDate <= endOfWeek;
        }

        if (timeFilter === "This Month") {
          return scheduleDate >= startOfMonth && scheduleDate <= endOfMonth;
        }

        return true;
      });
    }

    if (searchTerm.trim()) {
      const value = searchTerm.toLowerCase();
      list = list.filter(
        (item) =>
          item.title?.toLowerCase().includes(value) ||
          item.taskType?.toLowerCase().includes(value) ||
          item.restroomLabel?.toLowerCase().includes(value) ||
          item.status?.toLowerCase().includes(value)
      );
    }

    return list.sort((a, b) => getAssignedSortTime(b) - getAssignedSortTime(a));
  }, [schedules, filter, timeFilter, searchTerm]);

  const stats = useMemo(() => {
    return {
      total: schedules.length,
      assigned: schedules.filter((s) => s.status === "Assigned").length,
      inProgress: schedules.filter((s) => s.status === "InProgress").length,
      completed: schedules.filter((s) => s.status === "Completed").length,
      verified: schedules.filter((s) => s.status === "Verified").length,
      rejected: schedules.filter((s) => s.status === "Rejected").length,
    };
  }, [schedules]);

  const weeklyStats = useMemo(() => {
    const now = new Date();
    const startOfWeek = getStartOfWeek(now);
    const endOfWeek = getEndOfWeek(now);

    const weeklySchedules = schedules.filter((schedule) => {
      const scheduleDate = new Date(schedule.date);
      return !Number.isNaN(scheduleDate.getTime()) &&
        scheduleDate >= startOfWeek &&
        scheduleDate <= endOfWeek;
    });

    return {
      rangeLabel: `${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`,
      total: weeklySchedules.length,
      assigned: weeklySchedules.filter((s) => s.status === "Assigned").length,
      inProgress: weeklySchedules.filter((s) => s.status === "InProgress").length,
      completed: weeklySchedules.filter((s) => s.status === "Completed").length,
      verified: weeklySchedules.filter((s) => s.status === "Verified").length,
      rejected: weeklySchedules.filter((s) => s.status === "Rejected").length,
    };
  }, [schedules]);

  const todaySchedules = useMemo(() => {
    const now = new Date();

    return schedules
      .filter((item) => {
        const scheduleDate = new Date(item.date);
        return (
          ACTIVE_STATUSES.includes(item.status) &&
          !Number.isNaN(scheduleDate.getTime()) &&
          scheduleDate.toDateString() === now.toDateString()
        );
      })
      .sort((a, b) => getScheduleDateTime(a) - getScheduleDateTime(b));
  }, [schedules]);

  const upcomingSchedules = useMemo(() => {
    const now = new Date();

    return schedules
      .filter((item) => {
        const scheduleDateTime = getScheduleDateTime(item);

        return (
          ACTIVE_STATUSES.includes(item.status) &&
          scheduleDateTime &&
          scheduleDateTime.getTime() > now.getTime()
        );
      })
      .sort((a, b) => getScheduleDateTime(a) - getScheduleDateTime(b))
      .slice(0, 3);
  }, [schedules]);

  const reviewedSchedules = useMemo(() => {
    return schedules
      .filter((item) => ["Verified", "Rejected"].includes(item.status))
      .sort((a, b) => {
        const aTime = new Date(a.verifiedAt || a.updatedAt || a.date || 0).getTime();
        const bTime = new Date(b.verifiedAt || b.updatedAt || b.date || 0).getTime();
        return bTime - aTime;
      });
  }, [schedules]);

  const handleStart = async (id) => {
    try {
      setBusyAction(id);
      await startWork(id);
      showTaskMessage(id, "success", "Work started successfully");
      await loadSchedules();
    } catch (error) {
      showTaskMessage(id, "error", error?.response?.data?.message || "Failed to start work");
    } finally {
      setBusyAction("");
    }
  };

  const handleRevertStart = async (id) => {
    try {
      setBusyAction(id);
      await revertStartWork(id);
      showTaskMessage(id, "success", "Task moved back to assigned");
      await loadSchedules();
    } catch (error) {
      showTaskMessage(id, "error", error?.response?.data?.message || "Failed to change status");
    } finally {
      setBusyAction("");
    }
  };

  const handleRedoTask = async (id) => {
    try {
      setBusyAction(id);
      await reworkRejectedTask(id);
      showTaskMessage(id, "success", "Task moved to rework. Please complete and resubmit.");
      await loadSchedules();
    } catch (error) {
      showTaskMessage(id, "error", error?.response?.data?.message || "Failed to start rework");
    } finally {
      setBusyAction("");
    }
  };

  const uploadSelectedProof = async (id, file) => {
    try {
      if (!file) {
        showProofMessage(id, "error", "Please select a proof image first");
        return;
      }

      setBusyAction(id);
      await uploadProof(id, file);

      setProofFiles((prev) => ({
        ...prev,
        [id]: null,
      }));

      showProofMessage(id, "success", "Proof image uploaded successfully");
      await loadSchedules();
    } catch (error) {
      showProofMessage(id, "error", error?.response?.data?.message || "Failed to upload proof");
    } finally {
      setBusyAction("");
    }
  };

  const handleFileChange = async (id, file) => {
    setProofFiles((prev) => ({
      ...prev,
      [id]: file,
    }));

    if (file) {
      await uploadSelectedProof(id, file);
    }
  };

  const handleUploadProof = async (id) => {
    await uploadSelectedProof(id, proofFiles[id]);
  };

  const handleRemoveProof = async (id, publicId) => {
    try {
      if (!publicId) {
        showProofMessage(id, "error", "Unable to remove image");
        return;
      }

      setBusyAction(id);
      await removeProof(id, publicId);
      showProofMessage(id, "success", "Proof image removed successfully");
      await loadSchedules();
    } catch (error) {
      showProofMessage(id, "error", error?.response?.data?.message || error?.message || "Failed to remove proof image");
    } finally {
      setBusyAction("");
    }
  };

  const handleFormChange = (id, field, value) => {
    setFormState((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleComplete = async (id) => {
    try {
      setBusyAction(id);
      const payload = {
        staffNote: formState[id]?.staffNote || "",
        materialsUsed: formState[id]?.materialsUsed || "",
        issuesFound: formState[id]?.issuesFound || "",
      };

      await completeWork(id, payload);
      setMessage({ type: "", text: "" });
      showTaskMessage(id, "success", "Work completed and submitted for manager review.");
      await loadSchedules();
    } catch (error) {
      showTaskMessage(id, "error", error?.response?.data?.message || "Failed to complete work");
    } finally {
      setBusyAction("");
    }
  };

  return {
    schedules,
    filteredSchedules,
    todaySchedules,
    upcomingSchedules,
    reviewedSchedules,
    loading,
    busyAction,
    filter,
    setFilter,
    timeFilter,
    setTimeFilter,
    searchTerm,
    setSearchTerm,
    proofFiles,
    proofMessageById,
    taskMessageById,
    formState,
    message,
    stats,
    weeklyStats,
    loadSchedules,
    handleStart,
    handleRevertStart,
    handleRedoTask,
    handleFileChange,
    handleUploadProof,
    handleRemoveProof,
    handleFormChange,
    handleComplete,
  };
};

export default useMySchedules;
