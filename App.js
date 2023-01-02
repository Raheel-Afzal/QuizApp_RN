import React, {useEffect, useState} from 'react';
import {View, Text, Button, TextInput, StyleSheet} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RadioButton} from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';

import {openDatabase} from 'react-native-sqlite-storage';
const db = openDatabase({name: 'Assigment2'});

const Stack = createNativeStackNavigator();

function App() {
  useEffect(() => {
    CreateTable();
  }, []);

  const CreateTable = () => {
    db.transaction(txn => {
      txn.executeSql(
        `create Table if not Exists Products (id INTEGER PRIMARY KEY AUTOINCREMENT,name varchar(100),price varchar(100),cname varchar(100),unit varchar(20))`,
      );
    });
  };

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Insert" component={Insert} />
        <Stack.Screen name="SearchPage" component={SearchPage} />
        <Stack.Screen name="Update" component={Update} />
        <Stack.Screen name="Delete" component={Delete} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;

const HomeScreen = ({navigation}) => {
  return (
    <View style={{marginRight: 200}}>
      <Button
        title="New Product"
        onPress={() => {
          navigation.navigate('Insert');
        }}
      />
      <Button
        title="Search"
        onPress={() => {
          navigation.navigate('SearchPage');
        }}
      />
      <Button
        title="Update"
        onPress={() => {
          navigation.navigate('Update');
        }}
      />
      <Button
        title="Delete"
        onPress={() => {
          navigation.navigate('Delete');
        }}
      />
    </View>
  );
};
const Insert = () => {
  const [unit, setUnit] = useState('Kg');
  const [products, setProducts] = useState({
    name: '',
    price: '',
    company: '',
  });
  const AddProduct = () => {
    const {name, price, company} = products;

    db.transaction(txn => {
      txn.executeSql(
        `insert into  Products (name,price,cname,unit) values(?,?,?,?) `,
        [name, price, company, unit],
      );
    });
  };

  return (
    <View>
      <TextInput
        style={Styles.Input}
        value={products.name}
        onChangeText={text => {
          setProducts(curr => ({...curr, name: text}));
        }}
        placeholder="Enter Product Name"
      />
      <TextInput
        style={Styles.Input}
        value={products.price}
        onChangeText={text => {
          setProducts(curr => ({...curr, price: text}));
        }}
        placeholder="Enter Product Price"
      />
      <TextInput
        style={Styles.Input}
        value={products.company}
        onChangeText={text => {
          setProducts(curr => ({...curr, company: text}));
        }}
        placeholder="Enter Product Company"
      />

      <RadioButton.Group
        onValueChange={newValue => setUnit(newValue)}
        value={unit}>
        <Text style={Styles.Legend}>Select Unit:</Text>

        <View style={Styles.Rb}>
          <RadioButton.Item label="Kg" value="Kg" position="leading" />
          <RadioButton.Item label="Ltr" value="Ltr" position="leading" />
        </View>
      </RadioButton.Group>

      <View style={Styles.Save}>
        <Button title="Save" onPress={() => AddProduct()} />
      </View>
    </View>
  );
};
const SearchPage = () => {
  const [value, setValue] = useState('');
  const [text, setText] = useState('');
  const [data, setData] = useState({});

  if (value === 'company') {
    db.transaction(txt => {
      txt.executeSql(
        `select name,price,cname from Products where cname=?`,
        [text],
        (sqltxn, res) => {
          console.log(res);
          let record = res.rows.item(0);
          setData({
            name: record.name,
            price: record.price,
            cname: record.cname,
          });
        },
      );
    });
  }

  if (value === 'product') {
    db.transaction(txt => {
      txt.executeSql(
        `select name,price,cname from Products where name=?`,
        [text],
        (sqltxn, res) => {
          console.log(res);
          let record = res.rows.item(0);
          setData({
            name: record.name,
            price: record.price,
            cname: record.cname,
          });
        },
      );
    });
  }

  if (value === 'price') {
    db.transaction(txt => {
      txt.executeSql(
        `select name,price,cname from Products where price>?`,
        [text],
        (sqltxn, res) => {
          console.log(res);
          let record = res.rows.item(0);
          setData({
            name: record.name,
            price: record.price,
            cname: record.cname,
          });
        },
      );
    });
  }

  return (
    <View>
      <TextInput
        style={Styles.Input}
        value={text}
        onChangeText={newText => {
          setText(newText);
        }}
        placeholder="Enter Text"
      />

      <RadioButton.Group
        onValueChange={newValue => setValue(newValue)}
        value={value}>
        <View style={Styles.RbSearch}>
          <RadioButton.Item
            label="company"
            value="company"
            position="leading"
          />
          <RadioButton.Item
            label="product"
            value="product"
            position="leading"
          />
          <RadioButton.Item label="> price" value="price" position="leading" />
        </View>
      </RadioButton.Group>
      <View style={Styles.List}>
        <Text style={Styles.listText}> Name: {data.name}</Text>
        <Text style={Styles.listText}>Company: {data.cname}</Text>
        <Text style={Styles.listText}> Price: {data.price}</Text>
      </View>
    </View>
  );
};
const Update = () => {
  const [open, setOpen] = useState(false);
  const [selectedName, setSelectedName] = useState(null);
  const [items, setItems] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [newPrice, setNewPrice] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    LoadPicker();
  }, [productsData]);

  const LoadPicker = () => {
    let result = [];
    productsData.map(item => {
      const obj = {label: item.name, value: item.name};
      return result.push(obj);
    });
    setItems(result);
  };
  const fetchProducts = () => {
    db.transaction(txt => {
      txt.executeSql(`select * from Products`, [], (sqltxn, res) => {
        let resultSet = [];
        for (let i = 0; i < res.rows.length; i++) {
          let record = res.rows.item(i);
          resultSet.push({
            id: record.id,
            name: record.name,
            price: record.price,
            cname: record.cname,
            unit: record.unit,
          });
        }
        setProductsData(resultSet);
      });
    });
  };

  const Update = () => {
    db.transaction(txt => {
      txt.executeSql(`update  Products set price=? where name=?`, [
        newPrice,
        selectedName,
      ]);
    });

    fetchProducts();
  };

  return (
    <View>
      <DropDownPicker
        zIndex={3000}
        zIndexInverse={1000}
        open={open}
        value={selectedName}
        items={items}
        setOpen={setOpen}
        setValue={setSelectedName}
        setItems={setItems}
      />
      <TextInput
       zIndex={2000}
       zIndexInverse={2000}
        style={Styles.Input}
        value={newPrice}
        onChangeText={text => {
          setNewPrice(text);
        }}
        placeholder="Enter Updated Price"
      />
      <View style={Styles.btn}>
        <Button
          title="Update"
          onPress={() => {
            Update();
          }}
        />
      </View>
    </View>
  );
};
const Delete = () => {
  const [open, setOpen] = useState(false);
  const [selectedName, setSelectedName] = useState(null);
  const [items, setItems] = useState([]);
  const [productsData, setProductsData] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    LoadPicker();
  }, [productsData]);

  const LoadPicker = () => {
    let result = [];
    productsData.map(item => {
      const obj = {label: item.name, value: item.name};
      return result.push(obj);
    });
    setItems(result);
  };

  const fetchProducts = () => {
    db.transaction(txt => {
      txt.executeSql(`select * from Products`, [], (sqltxn, res) => {
        let resultSet = [];
        for (let i = 0; i < res.rows.length; i++) {
          let record = res.rows.item(i);
          resultSet.push({
            id: record.id,
            name: record.name,
            price: record.price,
            cname: record.cname,
            unit: record.unit,
          });
        }
        setProductsData(resultSet);
      });
    });
  };

  const Delete = id => {
    db.transaction(txt => {
      txt.executeSql(`delete from Products where name=?`, [selectedName]);
    });
    fetchProducts();
  };
  return (
    <View>
      <DropDownPicker
        open={open}
        value={selectedName}
        items={items}
        setOpen={setOpen}
        setValue={setSelectedName}
        setItems={setItems}
      />
      <View style={Styles.btn}>
        <Button
          title="Delete"
          onPress={() => {
            Delete();
          }}
        />
      </View>
    </View>
  );
};

const Styles = StyleSheet.create({
  Input: {
    borderWidth: 1,
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 10,
    borderColor: '#959595',
  },
  Rb: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginHorizontal: 15,
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    borderColor: '#959595',
  },
  Legend: {
    width: 94,
    paddingHorizontal: 5,
    position: 'relative',
    top: 10,
    left: 35,
    backgroundColor: '#f2f2f2',
    zIndex: 1,
    fontSize: 16,
  },
  Save: {
    marginTop: 15,
    marginRight: 250,
    marginLeft: 15,
  },
  RbSearch: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  btn: {
    marginVertical: 20,
    marginHorizontal: 140,
  },
  List: {
    margin: 30,
  },
  listText: {
    fontSize: 20,
    lineHeight: 40,
    color: '#000',
    fontWeight: '600',
  },
});
