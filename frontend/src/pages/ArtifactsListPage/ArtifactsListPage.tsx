import {Button, Col, Container, Form, Input, Row} from "reactstrap";
import ArtifactCard from "src/components/ArtifactCard";
import {ChangeEvent, useEffect} from "react";
import {useAppDispatch, useAppSelector} from "store/store.ts";
import {fetchArtifacts, updateArtifactName} from "src/store/slices/artifactsSlice";
import Bin from "components/Bin";

export const ArtifactsListPage = () => {

    const dispatch = useAppDispatch()

    const samples = useAppSelector((state) => state.samples.samples)

    const isAuthenticated = useAppSelector((state) => state.user?.is_authenticated)

    const {draft_analysis_request, artifacts_count} = useAppSelector((state) => state.calculationrequests)

    const hasDraft = draft_analysis_request != null

    const query = useAppSelector((state) => state.samples.query)

    const handleChange = (e:ChangeEvent<HTMLInputElement>) => {
        dispatch(updateArtifactName(e.target.value))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        dispatch(fetchArtifacts())
    }

    useEffect(() => {
        dispatch(fetchArtifacts())
    }, [])

    return (
        <Container>
            <Row className="mb-5">
                <Col md="6">
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col xs="8">
                                <Input value={query} onChange={handleChange} placeholder="Поиск..."></Input>
                            </Col>
                            <Col>
                                <Button color="primary" className="w-100 search-btn">Поиск</Button>
                            </Col>
                        </Row>
                    </Form>
                </Col>
                {isAuthenticated &&
                    <Col className="d-flex flex-row justify-content-end" md="6">
                        <Bin isActive={hasDraft} draft_analysis_request={draft_analysis_request} artifacts_count={artifacts_count} />
                    </Col>
                }
            </Row>
            <Row className="mt-5 d-flex">
                {samples?.map(sample => (
                    <Col key={sample.id} className="mb-5 d-flex justify-content-center" sm="12" md="6" lg="4">
                        <ArtifactCard sample={sample} showAddBtn={isAuthenticated} showMM={false} />
                    </Col>
                ))}
            </Row>
        </Container>
    );
};