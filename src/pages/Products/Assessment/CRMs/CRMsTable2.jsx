import React, { useEffect, useState } from 'react';
import { collection, doc, getDoc, getDocs, getFirestore } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';

export default function CRMsTable2({ productID, handleWeights }) {
  const [totalWeight, setTotalWeight] = useState(0);
  const [productWeight, setProductWeight] = useState(0);
  const db = getFirestore();

  useEffect(() => {
    const fetchData = async () => {
      let weightSum = 0;

      // Fetch the weight from the product document
      const productRef = doc(db, 'products', productID);
      const productDoc = await getDoc(productRef);
      setProductWeight(productDoc.data().weight);

      // 모든 substnacemass 값 가져와 합치기
      const partsRef = collection(db, `products/${productID}/parts`);
      const partsSnap = await getDocs(partsRef);

      for (const part of partsSnap.docs) {
        const materialsRef = collection(db, `products/${productID}/parts/${part.id}/materials`);
        const materialsSnap = await getDocs(materialsRef);

        for (const material of materialsSnap.docs) {
          const substancesRef = collection(db, `products/${productID}/parts/${part.id}/materials/${material.id}/substances`);
          const substancesSnap = await getDocs(substancesRef);

          for (const substance of substancesSnap.docs) {
            weightSum += substance.data().substancemass;
          }
        }
      }

      setTotalWeight(weightSum);
      handleWeights(weightSum, productWeight);
    };

    fetchData();
  }, [db, productID, handleWeights]);

  return (
    <TableContainer>
      <Table sx={{ minWidth: 300 }} size="small">
        <TableBody>
          <TableRow>
            <TableCell align="center" style={{ border: '1px solid black' }}>CRMs Total Weight (g)</TableCell>
            <TableCell align="center" style={{ border: '1px solid black' }}>{totalWeight}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell align="center" style={{ border: '1px solid black' }}>Product Weight (g)</TableCell>
            <TableCell align="center" style={{ border: '1px solid black' }}>{productWeight}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};