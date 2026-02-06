import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { DragonDossierPage } from "../pages/DragonDossierPage";
import { DragonsPage } from "../pages/DragonsPage";
import { LoginPage } from "../pages/LoginPage";


export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Login fuera del layout (si quieres que sea diferente) */}
                <Route path="/" element={<LoginPage />} />

                {/* Todo lo “interno” con el layout centrado */}
                <Route element={<AppShell />}>
                    <Route path="/dragons" element={<DragonsPage />} />
                    <Route path="/dragons/:dragonId" element={<DragonDossierPage />} />

                    {/* opcional */}
                    <Route path="*" element={<Navigate to="/dragons" replace />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
