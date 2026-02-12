import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { DragonDossierPage } from "../pages/DragonDossierPage";
import { DragonsPage } from "../pages/DragonsPage";
import { LoginPage } from "../pages/LoginPage";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LoginPage />} />

                <Route element={<AppShell />}>
                    <Route path="/dragons" element={<DragonsPage />} />
                    <Route path="/dragons/:dragonId" element={<DragonDossierPage />} />
                    <Route path="*" element={<Navigate to="/dragons" replace />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
