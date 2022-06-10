// importing all the packages
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import * as EmailValidator from 'node-email-validation';
import DataTable from 'react-data-table-component';
import { Button, Form, Input, Layout } from 'antd';
import 'antd/dist/antd.css';
import emailjs from '@emailjs/browser';

const { Header, Content} = Layout;
const { TextArea } = Input;
const serviceID = "service_zsigzka";
const templateID = "template_y02pa58";
const publicKey = "6BjRZ-yBAkZhN-d3k";

function App() {

  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [ch,setCh] = useState(true);
  const [sub,setSub] = useState();
  const [body,setBody] = useState();

  // process CSV data
  const processData = dataString => {
    const dataStringLines = dataString.split(/\r\n|\n/);
    const headers = dataStringLines[0].split(/,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/);
    
    const list = [];
    for (let i = 1; i < dataStringLines.length; i++) {
      const row = dataStringLines[i].split(/,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/);
      if (headers && row.length == headers.length) {
        const obj = {};
        for (let j = 0; j < headers.length; j++) {
          let d = row[j];
          if (d.length > 0) {
            if (d[0] == '"')
              d = d.substring(1, d.length - 1);
            if (d[d.length - 1] == '"')
              d = d.substring(d.length - 2, 1);
          }
          if (headers[j]) {
            obj[headers[j]] = d;
          }
        }

        // remove the blank rows
        if (Object.values(obj).filter(x => x).length > 0) {
          list.push(obj);
        }
      }
    }
    
    // prepare columns list from headers
    const columns = headers.map(c => ({
      name: c,
      selector: c,
    }));

    setData(list);
    setColumns(columns);
  }

  // handle file upload
  const handleFileUpload = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      /* Parse data */
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      /* Get first worksheet */
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      /* Convert array of arrays */
      const data = XLSX.utils.sheet_to_csv(ws, { header: 1 });
      processData(data);
    };
    reader.readAsBinaryString(file);
  }

  const dataV = [];
  const dataIV = [];

  //valid and invalid email separation
  for(let i=0;i<data.length;i++){
    if(EmailValidator.is_email_valid(data[i].Email)) dataV.push(data[i]);
    else dataIV.push(data[i]);
  }


  //form submit
  const onFinish = (values) => {
    // console.log('Success:', values);
    // console.log(data);
    setCh(!ch);
    setSub(values.sub);
    setBody(values.body);
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };


  //send mail
  const sendMail = () => {
    console.log(body);
    console.log(sub);
    let al = true;
    for(let i=0;i<dataV.length;i++){
      let templateParams = {
        to: dataV[i].Email,
        subject: sub,
        body: body
      }
      // console.log(publicKey);
      // console.log(templateID);
      // console.log(serviceID);
      emailjs.send(serviceID, templateID, templateParams, publicKey)
        .then(function(response) {
          console.log('SUCCESS!', response.status, response.text);
        }, function(error) {
          console.log('FAILED...', error);
          al=false;
        });
    }
    if(al){
        alert("Mail Sent");
    } 
  };

  if(ch){
  return (
     <Layout>

    <Header className="header">
      <h1 style={{color:'white'}}>MASS MAIL</h1>
    </Header>
        <Content
          style={{
            padding: ' 24px',
            minHeight: 280,
          }}
        >
          <div 
      className='container'
      style={{maxWidth:'60%', margin:'0 auto'}}>
    <Form
      name="basic"
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
      layout="vertical"
    >
        
        <Form.Item
          label="To"
          name="to"
          rules={[
            {
              required: true,
              message: 'Please upload the csv file',
            },
          ]}
          >
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileUpload}
          style={{paddingLeft:'10px'}}
        />
        </Form.Item>

      <Form.Item
        label="Subject"
        name="sub"
        rules={[
          {
            required: true,
            message: 'Please input subject of the email!',
          },
        ]}
      >
        <Input style={{minHeight:'50px'}}/>
      </Form.Item>

      <Form.Item
        label="Body"
        name="body"
        rules={[
          {
            required: true,
            message: 'Please input your password!',
          },
        ]}
      >
        <TextArea style={{minHeight:'200px'}}/>
      </Form.Item>

      <Form.Item
        wrapperCol={{
          offset: 8,
          span: 16,
        }}
      >
        <Button type="primary" htmlType="submit">
          Check
        </Button>
      </Form.Item>
    </Form>

    </div>
        </Content>
  </Layout>
  );
}
else{
  return(
    <Layout>

    <Header className="header">
      <h1 style={{color:'white'}}>MASS MAIL</h1>
    </Header>
        <Content
          style={{
            padding: ' 10px',
            minHeight: 280,
          }}
        >
          <div 
      className='container'
      style={{ margin:'0 auto'}}>

      <div className='row'>

        <div className='col-6'>
          <h1>Valid Email</h1>
            <DataTable
              pagination
              highlightOnHover
              columns={columns}
              data={dataV}
            />
        </div>

        <div className='col-6'>
          <h1>Invalid Email</h1>
              <DataTable
                pagination
                highlightOnHover
                columns={columns}
                data={dataIV}
              />
        </div>

      </div>
      
      <div style={{textAlign:'center', padding:'10px'}}>
        <Button type='primary' onClick={sendMail}>Send</Button>
      </div>

    </div>
        </Content>
  </Layout>
  )
}
}


export default App;
