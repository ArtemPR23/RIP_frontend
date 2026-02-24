import {useState} from "react";
import Header from "components/Header";
import Breadcrumbs from "components/Breadcrumbs";
import ArtifactPage from "src/pages/ArtifactPage";
import ArtifactsListPage from "src/pages/ArtifactsListPage";
import {Route, Routes} from "react-router-dom";
import {T_Artifact} from "src/modules/types.ts";
import {Container, Row} from "reactstrap";
import HomePage from "pages/HomePage";
import "./styles.css"

function App() {

    const [artifacts, setArtifacts] = useState<T_Artifact[]>([])

    const [selectedArtifact, setSelectedArtifact] = useState<T_Artifact | null>(null)

    const [isMock, setIsMock] = useState(false);

    const [artifactName, setArtifactName] = useState<string>("")

    return (
        <div>
            <Header/>
            <Container className="pt-4">
                <Row className="mb-3">
                    <Breadcrumbs selectedArtifact={selectedArtifact} />
                </Row>
                <Row>
                    <Routes>
						<Route path="/" element={<HomePage />} />
                        <Route path="/artifacts/" element={<ArtifactsListPage artifacts={artifacts} setArtifacts={setArtifacts} isMock={isMock} setIsMock={setIsMock} artifactName={artifactName} setArtifactName={setArtifactName}/>} />
                        <Route path="/artifacts/:id" element={<ArtifactPage selectedArtifact={selectedArtifact} setSelectedArtifact={setSelectedArtifact} isMock={isMock} setIsMock={setIsMock}/>} />
                    </Routes>
                </Row>
            </Container>
        </div>
    )
}

export default App
