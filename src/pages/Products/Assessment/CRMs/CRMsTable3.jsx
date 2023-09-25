import React, { useEffect, useState } from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody, Paper, TableContainer } from '@mui/material';
import { collection, getDocs, getFirestore } from 'firebase/firestore';

export default function CRMsTable3({ productID, productWeight }) {
  const [data, setData] = useState([]);
  const db = getFirestore();

  useEffect(() => {
    const fetchData = async () => {
      let result = [];

      const partsRef = collection(db, 'products', productID, 'parts');
      const partsSnap = await getDocs(partsRef);

      for (const partDoc of partsSnap.docs) {
        const partData = partDoc.data();

        const materialsRef = collection(db, 'products', productID, 'parts', partDoc.id, 'materials');
        const materialsSnap = await getDocs(materialsRef);

        for (const materialDoc of materialsSnap.docs) {
          const materialData = materialDoc.data();

          const substancesRef = collection(db, 'products', productID, 'parts', partDoc.id, 'materials', materialDoc.id, 'substances');
          const substancesSnap = await getDocs(substancesRef);

          for (const substanceDoc of substancesSnap.docs) {
            const substanceData = substanceDoc.data();
            result.push({
              partName: partData.name,
              partMass: partData.weight,
              materialName: materialData.materialname,
              materialMass: materialData.materialmass,
              CRMName: substanceData.substancename,
              CASNo: substanceData.casnumber,
              CRMMass: substanceData.substancemass,
            });
          }
        }
      }

      setData(result);
    };

    fetchData();
  }, [db, productID]);

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="center">Part Name</TableCell>
            <TableCell align="center">Part Mass(g)</TableCell>
            <TableCell align="center">Material Name</TableCell>
            <TableCell align="center">Material Mass(g)</TableCell>
            <TableCell align="center">CRMs Name</TableCell>
            <TableCell align="center">CAS No.</TableCell>
            <TableCell align="center">CRM Mass(g)</TableCell>
            <TableCell align="center">CRM Mass(%)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index}>
              <TableCell align="center" component="th" scope="row">{row.partName}</TableCell>
              <TableCell align="center">{row.partMass}</TableCell>
              <TableCell align="center">{row.materialName}</TableCell>
              <TableCell align="center">{row.materialMass}</TableCell>
              <TableCell align="center">{row.CRMName}</TableCell>
              <TableCell align="center">{row.CASNo}</TableCell>
              <TableCell align="center">{row.CRMMass}</TableCell>
              <TableCell align="center">{productWeight > 0 ? ((row.CRMMass / productWeight) * 100).toFixed(2) + '%' : 'N/A'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}