import { useParams } from "react-router-dom";
import { Shell } from "../components/layout/Shell";
import { ParchmentCard } from "../components/ui/ParchmentCard";

export function DragonDossierPage() {
    const { id } = useParams();

    return (
        <Shell>
            <ParchmentCard>
                <h2 className="text-2xl" style={{ fontFamily: "Cinzel, serif" }}>
                    Dragon Dossier
                </h2>
                <p className="opacity-80">Dragon ID: {id}</p>

                <div className="mt-6 opacity-80">
                    Next: details + encounter timeline + create encounter + close dragon.
                </div>
            </ParchmentCard>
        </Shell>
    );
}
