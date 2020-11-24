/* 
NewItemForm:
************ 
Este es el formulario para la creación de un nuevo item. 
Durante el proceso se introduce la información que describe al objeto de
forma general. Aquí no se especifican cantidades, ni ubicaciones, ni estados.
Es por ello que el inventario puede describir items aunque no se tengan
físicamente.

Los items se organizan en categorías y subcategorías. Si las mismas no existen,
se pueden crear dándole click a un buton "nueva", el cual cambia el select por un 
input para que se pueda crear la categoría, además de mostrar un input para crear una
subcategoría. Todas las categorías deben tener al menos una subcategoría. Queda 
a criterio del usuario como clasificar las categorías de los items.
*/

import React, { useState, useContext } from "react";

import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { FormControl, FormGroup } from "react-bootstrap";

/* Firebase */
import firebaseApp from "../firebaseApp";
import { AuthContext } from "../Auth";
import ItemSchema from "../Models/ItemSchema";

// Router
import { useHistory } from "react-router-dom";

import AccordionFormWrap from "./AccordionFormWrap.jsx";
import InventorySchema from "../Models/InventorySchema";

/* New Item form ------------------------------------ */

const NewItemForm = (props) => {
  // Browsing:
  const history = useHistory();

  // Auth:
  const { currentUser } = useContext(AuthContext);

  // Data:
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");

  // Changes:
  const [newcat, setNewCat] = useState(false); // Indica si se han creado nuevas categorías
  const [newsubcat, setNewSubcat] = useState(false); // Indica si se han creado nuevas subcategorías

  // Options:
  const categories = props.inventory.categories.map((cat) => cat.name);
  const [subcatlist, setSubcatlist] = useState([]);

  // METHODS:

  const listSubcats = (name, catArray) => {
    /* Lista las subcategorías correspondientes 
    cada vez que se selecciona una categoría */
    let subcats = [];
    catArray.forEach((cat) => {
      if (cat.name === name) {
        subcats = cat.subcategories;
      }
    });
    return subcats;
  };

  const updateInventory = () => {
    /* Determina si se han creado nuevas categorías y/o subcategorías.
    De ser así, actualiza la lista de categorías en el inventario al que
    corresponde el item */

    let inventory = props.inventory;

    if (newcat) {
      inventory.categories.push({
        name: category,
        subcategories: [subcategory],
      });
    }

    if (!newcat && newsubcat) {
      let index = 0;
      inventory.categories.forEach((cat) => {
        if (cat.name === category) {
          inventory.categories[index].subcategories.push(subcategory);
        } else {
          index++;
        }
      });
    }

    return inventory;
  };

  const handleCreateItem = async () => {
    /* Maneja la accion que se dispara cuando el
    usuario le da al botón de crear item. Es la 
    encargada de estructurar la data en base al schema y
    comunicarse con la base de datos. */
    const db = firebaseApp.firestore();
    let newInventory = updateInventory();
    let data = {
      ...ItemSchema,
      inventoryId: props.inventory.id,
      creationdate: new Date(),
      creatorId: currentUser.uid,
      name,
      description,
      category,
      subcategory,
    };
    data = {
      ...data,
      changelog: [
        {
          date: data.creationdate,
          userId: currentUser.uid,
          groups: data.groups,
        },
      ],
    };
    console.log("he aqui el item a guardar", data);
    try {
      const docref = await db.collection("items").add(data); // Guardo el nuevo item, recupero la ref de firebase
      props.updateCurrentItem(docref.id); // Guardo el id del item en el state de App
      newInventory.items.push(docref.id);
      await db
        .collection("inventories")
        .doc(props.inventory.id)
        .update(newInventory);
      console.log("Se ha creado el item y se ha actualizado el inventario");
      history.push("./inventories");
      history.goBack();
    } catch (error) {
      console.log(error);
    }
  };

  // RENDER:

  return (
    <AccordionFormWrap title={"Nuevo item"}>
      <Form>
        <FormGroup>
          <Form.Label>Nombre: </Form.Label>
          <FormControl
            type="text"
            onChange={(e) => {
              setName(e.target.value);
            }}
          ></FormControl>
        </FormGroup>
        <FormGroup>
          <Form.Label>Descripción: </Form.Label>
          <FormControl
            as="textarea"
            rows={3}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
            }}
          ></FormControl>
        </FormGroup>
        <FormGroup>
          <Form.Label>Categoria: </Form.Label>
          {/* Si no voy a generar una nueva categoría muestro un menu 
          select con las opciones que tengo en el inventario, 
          caso contrario muestro un input */}
          {!newcat && (
            <Form.Control
              as="select"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setSubcategory("");
                setSubcatlist(
                  listSubcats(e.target.value, props.inventory.categories)
                );
              }}
            >
              <option value={""}>Elije una categoría</option>
              {categories.map((cat) => {
                return (
                  <option key={cat.index + "-" + cat} value={cat}>
                    {cat}
                  </option>
                );
              })}
            </Form.Control>
          )}

          {newcat && (
            <FormControl
              placeholder="Nombre de la categoría"
              style={{ marginTop: "10px" }}
              type="text"
              onChange={(e) => {
                setCategory(e.target.value);
              }}
            ></FormControl>
          )}
        </FormGroup>
        <Button
          size="sm"
          style={{ marginBottom: "10px" }}
          variant={newcat ? "warning" : "info"}
          onClick={(e) => {
            e.preventDefault();
            newcat ? setNewCat(false) : setNewCat(true);
          }}
        >
          {newcat ? "Cancelar" : "Nueva"}
        </Button>
        <FormGroup>
          <Form.Label>Subcategoria: </Form.Label>

          {!newcat && !newsubcat && (
            <Form.Control
              as="select"
              value={subcategory}
              onChange={(e) => {
                setSubcategory(e.target.value);
              }}
            >
              <option value={""}>Elije una subcategoría</option>
              {subcatlist.map((subcat) => {
                return (
                  <option key={subcat.index + "-" + subcat} value={subcat}>
                    {subcat}
                  </option>
                );
              })}
            </Form.Control>
          )}

          {(newcat || newsubcat) && (
            <FormControl
              placeholder="Nombre de la subcategoría"
              value={subcategory}
              style={{ marginTop: "10px" }}
              type="text"
              onChange={(e) => {
                setSubcategory(e.target.value);
              }}
            ></FormControl>
          )}
        </FormGroup>
        {!newcat && (
          <Button
            size="sm"
            style={{ marginBottom: "10px" }}
            variant={newsubcat ? "warning" : "info"}
            onClick={(e) => {
              e.preventDefault();
              newsubcat ? setNewSubcat(false) : setNewSubcat(true);
            }}
          >
            {newsubcat ? "Cancelar" : "Nueva"}
          </Button>
        )}
        <Button variant="info" block onClick={() => handleCreateItem()}>
          Agregar item
        </Button>
      </Form>
    </AccordionFormWrap>
  );
};

export default NewItemForm;
