import React, { useEffect, useMemo, useReducer, useState } from "react";

/* ===== Tipos ===== */
type TaskStatus = "pendiente" | "en progreso" | "completada";
type Filter = TaskStatus | "todas";
type Theme = "dark" | "light";
const FILTERS = ["todas", "pendiente", "en progreso", "completada"] as const;

interface Task {
    id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    createdAt: number;
    updatedAt: number;
}

/* ===== Reducer ===== */
type TaskAction =
    | { type: "ADD"; payload: { title: string; description?: string } }
    | { type: "UPDATE"; payload: { id: string; title: string; description?: string } }
    | { type: "DELETE"; payload: { id: string } }
    | { type: "SET_STATUS"; payload: { id: string; status: TaskStatus } }
    | { type: "REORDER"; payload: { from: number; to: number } }
    | { type: "HYDRATE"; payload: Task[] };

function move<T>(arr: T[], from: number, to: number): T[] {
    const copy = [...arr];
    const [item] = copy.splice(from, 1);
    copy.splice(to, 0, item);
    return copy;
}

function tasksReducer(state: Task[], action: TaskAction): Task[] {
    switch (action.type) {
        case "HYDRATE":
            // Mantén el orden guardado tal cual venga
            return [...action.payload];
        case "ADD": {
            const now = Date.now();
            return [
                {
                    id: crypto.randomUUID(),
                    title: action.payload.title.trim(),
                    description: action.payload.description?.trim() || "",
                    status: "pendiente",
                    createdAt: now,
                    updatedAt: now,
                },
                ...state,
            ];
        }
        case "UPDATE": {
            const now = Date.now();
            return state.map((t) =>
                t.id === action.payload.id
                    ? {
                        ...t,
                        title: action.payload.title.trim(),
                        description: action.payload.description?.trim() || "",
                        updatedAt: now,
                    }
                    : t
            );
        }
        case "DELETE":
            return state.filter((t) => t.id !== action.payload.id);
        case "SET_STATUS": {
            const now = Date.now();
            return state.map((t) =>
                t.id === action.payload.id ? { ...t, status: action.payload.status, updatedAt: now } : t
            );
        }
        case "REORDER": {
            const { from, to } = action.payload;
            if (from === to || from < 0 || to < 0 || from >= state.length || to >= state.length) return state;
            return move(state, from, to);
        }
        default:
            return state;
    }
}

/* ===== Persistencia ===== */
const LS_TASKS = "todo.tasks.v1";
const LS_THEME = "todo.theme.v1";

function useTasks() {
    const [state, dispatch] = useReducer(tasksReducer, [] as Task[]);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(LS_TASKS);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) dispatch({ type: "HYDRATE", payload: parsed });
            }
        } finally {
            setHydrated(true);
        }
    }, []);

    useEffect(() => {
        if (hydrated) localStorage.setItem(LS_TASKS, JSON.stringify(state));
    }, [state, hydrated]);

    return { tasks: state, dispatch } as const;
}

function useTheme() {
    const [theme, setTheme] = useState<Theme>("light");

    useEffect(() => {
        const saved = localStorage.getItem(LS_THEME) as Theme | null;
        if (saved === "dark" || saved === "light") setTheme(saved);
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem(LS_THEME, theme);
    }, [theme]);

    return { theme, setTheme } as const;
}

/* ===== Toast sencillo ===== */
type ToastKind = "success" | "info" | "error";
function Toast({
    message,
    kind,
    onClose,
}: {
    message: string;
    kind: ToastKind;
    onClose: () => void;
}) {
    const bg =
        kind === "success" ? "#16a34a" : kind === "error" ? "#dc2626" : "#2563eb";
    return (
        <div
            role="status"
            aria-live="polite"
            style={{
                position: "fixed",
                right: 16,
                bottom: 16,
                zIndex: 1000,
                background: bg,
                color: "white",
                padding: "12px 16px",
                borderRadius: 10,
                boxShadow: "0 12px 24px rgba(0,0,0,.2)",
                display: "flex",
                alignItems: "center",
                gap: 10,
                maxWidth: "calc(100vw - 32px)",
            }}
        >
            <span style={{ fontSize: 18, lineHeight: 1 }}>✓</span>
            <span style={{ fontWeight: 600 }}>{message}</span>
            <button
                onClick={onClose}
                aria-label="Cerrar notificación"
                style={{
                    marginLeft: 8,
                    background: "transparent",
                    border: "none",
                    color: "white",
                    cursor: "pointer",
                    fontSize: 18,
                }}
            >
                ×
            </button>
        </div>
    );
}

/* ===== Componentes ===== */
type FormMode = { type: "create" } | { type: "edit"; task: Task };

function TaskForm({
    mode,
    onSubmit,
    onCancel,
}: {
    mode: FormMode;
    onSubmit: (d: { title: string; description?: string }) => void;
    onCancel?: () => void;
}) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    // Inicializa/limpia inputs cuando cambia el modo
    useEffect(() => {
        if (mode.type === "edit") {
            setTitle(mode.task.title);
            setDescription(mode.task.description || "");
        } else {
            setTitle("");
            setDescription("");
        }
    }, [mode]);

    const isValid = title.trim().length > 0;

    function handleSubmit() {
        if (!isValid) return;
        onSubmit({ title, description });
        // siempre limpiar después de submit (crear o guardar)
        setTitle("");
        setDescription("");
    }

    return (
        <section className="paper">
            <h3 style={{ margin: "0 0 8px 0" }}>
                {mode.type === "edit" ? `Editando: ${mode.task.title}` : "Nueva tarea"}
            </h3>
            <div style={{ display: "grid", gap: 8 }}>
                <input
                    placeholder="Título"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    aria-label="Título de la tarea"
                />
                <textarea
                    placeholder="Descripción (opcional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ minHeight: 90 }}
                    aria-label="Descripción de la tarea"
                />
            </div>
            <div className="row" style={{ marginTop: 12 }}>
                <button
                    className="btn primary"
                    disabled={!isValid}
                    onClick={handleSubmit}
                    aria-disabled={!isValid}
                >
                    {mode.type === "edit" ? "Guardar" : "Agregar"}
                </button>
                {onCancel && (
                    <button className="btn" onClick={onCancel}>
                        Cancelar
                    </button>
                )}
            </div>
        </section>
    );
}

function FiltersBar({
    filter,
    setFilter,
    counts,
}: {
    filter: Filter;
    setFilter: (v: Filter) => void;
    counts: { all: number; p: number; ip: number; c: number };
}) {
    function getCount(label: (typeof FILTERS)[number]) {
        if (label === "todas") return counts.all;
        if (label === "pendiente") return counts.p;
        if (label === "en progreso") return counts.ip;
        return counts.c;
    }

    return (
        <div className="row" style={{ gap: 8 }} role="group" aria-label="Filtros de estado">
            {FILTERS.map((s) => (
                <button
                    key={s}
                    className="chip"
                    style={{
                        borderColor: filter === s ? "var(--accent)" : "var(--btn-border)",
                        background:
                            filter === s ? "color-mix(in oklab, var(--accent) 18%, var(--btn))" : "var(--btn)",
                    }}
                    onClick={() => setFilter(s)}
                    aria-pressed={filter === s}
                    title={`Ver ${s}`}
                >
                    <span style={{ textTransform: "capitalize" }}>{s}</span>
                    <span className="badge">{getCount(s)}</span>
                </button>
            ))}
        </div>
    );
}

/* ---- Tarjeta de tarea con soporte DnD ---- */
function TaskItem({
    task,
    onEdit,
    onAskDelete,
    onStatus,
    dnd,
}: {
    task: Task;
    onEdit: (t: Task) => void;
    onAskDelete: (t: Task) => void;
    onStatus: (id: string, status: TaskStatus) => void;
    dnd: {
        onDragStart: (e: React.DragEvent, id: string) => void;
        onDragOver: (e: React.DragEvent, id: string) => void;
        onDrop: (e: React.DragEvent, id: string) => void;
        onDragEnd: () => void;
        isDragging: boolean;
        isOver: boolean;
    };
}) {
    return (
        <article
            className={`paper task-card ${dnd.isDragging ? "dragging" : ""} ${dnd.isOver ? "drag-over" : ""}`}
            draggable
            onDragStart={(e) => dnd.onDragStart(e, task.id)}
            onDragOver={(e) => dnd.onDragOver(e, task.id)}
            onDrop={(e) => dnd.onDrop(e, task.id)}
            onDragEnd={dnd.onDragEnd}
            aria-grabbed={dnd.isDragging}
            aria-dropeffect="move"
        >
            <div style={{ display: "grid", gap: 6 }}>
                <h4 style={{ margin: 0, fontSize: 18 }}>{task.title}</h4>
                {task.description && <p style={{ margin: 0 }}>{task.description}</p>}
                <small className="muted">Últ. actualización: {new Date(task.updatedAt).toLocaleString()}</small>
            </div>

            <div className="row" style={{ marginTop: 12 }}>
                <select
                    value={task.status}
                    onChange={(e) => onStatus(task.id, e.target.value as TaskStatus)}
                    style={{ width: "auto" }}
                    aria-label="Estado"
                >
                    <option value="pendiente">Pendiente</option>
                    <option value="en progreso">En progreso</option>
                    <option value="completada">Completada</option>
                </select>
                <div className="spacer" />
                <button className="btn" onClick={() => onEdit(task)}>
                    Editar
                </button>
                <button className="btn danger" onClick={() => onAskDelete(task)}>
                    Eliminar
                </button>
            </div>
        </article>
    );
}

function EmptyState() {
    return (
        <div className="paper" style={{ textAlign: "center", padding: 24 }}>
            <p style={{ margin: 0 }}>No hay tareas aún. ¡Agrega tu primera tarea! 📓</p>
        </div>
    );
}

function ConfirmModal({
    taskTitle,
    onCancel,
    onConfirm,
}: {
    taskTitle: string;
    onCancel: () => void;
    onConfirm: () => void;
}) {
    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,.55)",
                display: "grid",
                placeItems: "center",
                zIndex: 50,
                padding: 16,
            }}
        >
            <div className="paper" style={{ width: "min(520px, 100%)" }}>
                <h3 style={{ marginTop: 0 }}>¿Eliminar tarea?</h3>
                <p>
                    Vas a eliminar <strong>{taskTitle}</strong>. Esta acción no se puede deshacer.
                </p>
                <div className="row" style={{ justifyContent: "flex-end" }}>
                    <button className="btn" onClick={onCancel}>
                        Cancelar
                    </button>
                    <button className="btn danger" onClick={onConfirm}>
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ===== App ===== */
export default function App() {
    const { tasks, dispatch } = useTasks();
    const { theme, setTheme } = useTheme();

    const [mode, setMode] = useState<FormMode>({ type: "create" });
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<Filter>("todas");
    const [pendingDelete, setPendingDelete] = useState<Task | null>(null);

    // Toast
    const [toast, setToast] = useState<{ message: string; kind: ToastKind } | null>(null);
    useEffect(() => {
        if (!toast) return;
        const id = setTimeout(() => setToast(null), 2500);
        return () => clearTimeout(id);
    }, [toast]);

    // DnD state
    const [dragId, setDragId] = useState<string | null>(null);
    const [overId, setOverId] = useState<string | null>(null);

    // Contadores para los chips
    const counts = useMemo(() => {
        let p = 0,
            ip = 0,
            c = 0;
        for (const t of tasks) {
            if (t.status === "pendiente") p++;
            else if (t.status === "en progreso") ip++;
            else c++;
        }
        return { all: tasks.length, p, ip, c };
    }, [tasks]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return tasks.filter((t) => {
            const byText = !q || t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q);
            const byStatus = filter === "todas" ? true : t.status === filter;
            return byText && byStatus;
        });
    }, [tasks, search, filter]);

    function handleSubmit(data: { title: string; description?: string }) {
        if (mode.type === "edit") {
            dispatch({
                type: "UPDATE",
                payload: { id: mode.task.id, title: data.title, description: data.description },
            });
            setMode({ type: "create" });
            setToast({ message: "Tarea actualizada correctamente", kind: "success" });
        } else {
            dispatch({ type: "ADD", payload: data });
            setToast({ message: "Tarea creada correctamente", kind: "success" });
        }
    }

    // ---- Drag & Drop handlers ----
    function onDragStart(e: React.DragEvent, id: string) {
        setDragId(id);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", id);
    }
    function onDragOver(e: React.DragEvent, id: string) {
        e.preventDefault(); // necesario para permitir drop
        setOverId(id);
        e.dataTransfer.dropEffect = "move";
    }
    function onDrop(e: React.DragEvent, id: string) {
        e.preventDefault();
        const source = dragId || e.dataTransfer.getData("text/plain");
        if (!source || source === id) {
            setDragId(null);
            setOverId(null);
            return;
        }
        const from = tasks.findIndex((t) => t.id === source);
        const to = tasks.findIndex((t) => t.id === id);
        if (from !== -1 && to !== -1) {
            dispatch({ type: "REORDER", payload: { from, to } });
        }
        setDragId(null);
        setOverId(null);
    }
    function onDragEnd() {
        setDragId(null);
        setOverId(null);
    }

    return (
        <div>
            {/* HEADER */}
            <header className="hero">
                <h1>📘 To-Do List</h1>
                <div className="actions">
                    <button className="btn" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                        Cambiar a {theme === "dark" ? "Claro" : "Oscuro"}
                    </button>
                </div>
            </header>

            {/* CONTENIDO */}
            <main className="container">
                <TaskForm
                    mode={mode}
                    onSubmit={handleSubmit}
                    onCancel={mode.type === "edit" ? () => setMode({ type: "create" }) : undefined}
                />

                <section className="toolbar">
                    <input
                        placeholder="Buscar…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label="Buscar tareas"
                    />
                    <FiltersBar filter={filter} setFilter={setFilter} counts={counts} />
                </section>

                {filtered.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="grid">
                        {filtered.map((t) => (
                            <TaskItem
                                key={t.id}
                                task={t}
                                onEdit={(task) => setMode({ type: "edit", task })}
                                onAskDelete={(task) => setPendingDelete(task)}
                                onStatus={(id, status) => dispatch({ type: "SET_STATUS", payload: { id, status } })}
                                dnd={{
                                    onDragStart,
                                    onDragOver,
                                    onDrop,
                                    onDragEnd,
                                    isDragging: dragId === t.id,
                                    isOver: overId === t.id,
                                }}
                            />
                        ))}
                    </div>
                )}
            </main>

            {pendingDelete && (
                <ConfirmModal
                    taskTitle={pendingDelete.title || "Sin título"}
                    onCancel={() => setPendingDelete(null)}
                    onConfirm={() => {
                        dispatch({ type: "DELETE", payload: { id: pendingDelete.id } });
                        setPendingDelete(null);
                    }}
                />
            )}

            {toast && <Toast message={toast.message} kind={toast.kind} onClose={() => setToast(null)} />}
        </div>
    );
}
