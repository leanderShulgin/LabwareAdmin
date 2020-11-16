import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { Link } from "react-router-dom";

// Firebase
import firebaseApp from "../firebaseApp";

/* Bootstrap */
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

function SignUp() {
  const history = useHistory();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repswd, setRepswd] = useState("");
  // const [acceptTerms, setAcceptTerms] = useState(false);
  // const [error, setError] = useState(null);

  const handleSignOut = async () => {
    try {
      await firebaseApp.auth().createUserWithEmailAndPassword(email, password);
      history.push("./inventories");
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="row">
      <div className="col-md-3"></div>
      <div
        className="col-md-6 d-flex flex-column justify-content-center"
        style={{ minHeight: "100vh" }}
      >
        <h1>Registrate</h1>
        <Form>
          <Form.Group controlId="formBasicEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
            <Form.Text className="text-muted">
              No compartiremos tu email con nadie ni será visible para otros
              usuarios.
            </Form.Text>
          </Form.Group>

          <Form.Group >
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
          </Form.Group>
          <Form.Group >
            <Form.Label>Repite el password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Repeat Password"
              onChange={(e) => {
                setRepswd(e.target.value);
              }}
            />
          </Form.Group>
          <Button
            block
            variant="success"
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              handleSignOut();
            }}
          >
            Registrarme
          </Button>
        </Form>
        <p>¿ Ya tienes cuenta ?</p>
        <Link to="/signin">Ingresar</Link>
      </div>
      <div className="col-md-3"></div>
    </div>
  );
}

export default SignUp;
