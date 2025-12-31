import {Button, Col, Container, Form, Input, Row} from "reactstrap";
import ArtifactCard from "components/ArtifactCard";
import {ChangeEvent, FormEvent, useEffect} from "react";
import * as React from "react";
import {useAppSelector} from "src/store/store.ts";
import {updateArtifactName} from "src/store/slices/artifactsSlice";
import {T_Artifact} from "modules/types.ts";
import {ArtifactMocks} from "modules/mocks.ts";
import {useDispatch} from "react-redux";

type Props = {
    artifacts: T_Artifact[],
    setArtifact: React.Dispatch<React.SetStateAction<T_Artifact[]>>
    isMock: boolean,
    setIsMock: React.Dispatch<React.SetStateAction<boolean>>
}

const ArtifactsListPage = ({artifacts, setArtifact, isMock, setIsMock}:Props) => {

    const dispatch = useDispatch()

    const {artifact_name} = useAppSelector((state) => state.artifacts)

    const handleChange = (e:ChangeEvent<HTMLInputElement>) => {
        dispatch(updateArtifactName(e.target.value))
    }

    const createMocks = () => {
        setIsMock(true)
        setArtifact(ArtifactMocks.filter(artifact => artifact.title.toLowerCase().includes(artifact_name.toLowerCase())))
    }

    const handleSubmit = async (e:FormEvent) => {
        e.preventDefault()
        await fetchArtifacts()
    }

    const fetchArtifacts = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/artifacts/?title=${artifact_name.toLowerCase()}`)
            const data = await response.json()
            setArtifact(data.artifacts)
            setIsMock(false)
        } catch {
            createMocks()
        }
    }

    useEffect(() => {
        fetchArtifacts()
    }, []);

    return (
        <Container>
            <Row className="mb-5">
                <Col md="6">
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col xs="8">
                                <Input value={artifact_name} onChange={handleChange} placeholder="Поиск..."></Input>
                            </Col>
                            <Col>
                                <Button color="primary" className="w-100 search-btn">Поиск</Button>
                            </Col>
                        </Row>
                    </Form>
                </Col>
            </Row>
            <Row>
                {artifacts?.map(artifact => (
                    <Col key={artifact.id} sm="12" md="6" lg="4">
                        <ArtifactCard artifact={artifact} isMock={isMock} />
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default ArtifactsListPage