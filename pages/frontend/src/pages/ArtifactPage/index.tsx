import * as React from 'react';
import {useParams} from "react-router-dom";
import {useEffect} from "react";
import {CardImg, Col, Container, Row} from "reactstrap";
import mockImage from "assets/mock.png";
import {T_Artifact} from "modules/types.ts";
import {ArtifactMocks} from "modules/mocks.ts";

type Props = {
    selectedArtifact: T_Artifact | null,
    setSelectedArtifact: React.Dispatch<React.SetStateAction<T_Artifact | null>>,
    isMock: boolean,
    setIsMock: React.Dispatch<React.SetStateAction<boolean>>
}

const ArtifactPage = ({selectedArtifact, setSelectedArtifact, isMock, setIsMock}: Props) => {
    const { id } = useParams<{id: string}>();

    const fetchData = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/artifacts/${id}`)
            const data = await response.json()
            setSelectedArtifact(data)
        } catch {
            createMock()
        }
    }

    const createMock = () => {
        setIsMock(true)
        setSelectedArtifact(ArtifactMocks.find(artifact => artifact?.id == parseInt(id as string)) as T_Artifact)
    }

    useEffect(() => {
        if (!isMock) {
            fetchData()
        } else {
            createMock()
        }

        return () => setSelectedArtifact(null)
    }, []);

    if (!selectedArtifact) {
        return (
            <div>

            </div>
        )
    }

    return (
        <Container>
            <Row>
                <Col md="6">
                    <CardImg src={isMock ? mockImage as string : selectedArtifact.image} className="mb-3" />
                </Col>
                <Col md="6">
                    <h1 className="mb-3">{selectedArtifact.title}</h1>
                    <p className="fs-5">Индекс влияния: {selectedArtifact.base_influence_score}.</p>
                    <p className="fs-5">Описание: {selectedArtifact.description}</p>
                </Col>
            </Row>
        </Container>
    );
};

export default ArtifactPage