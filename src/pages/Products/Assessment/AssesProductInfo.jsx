import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../api/firebase';

export default function AssesProductInfo({ productID }) {
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, 'products', productID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProduct(docSnap.data());
      } else {
        console.log('No such document!');
      }
    };
    fetchData();
  }, [productID]);

  return (
    product && (
      <TableContainer>
        <Table sx={{ minWidth: 300 }} size="small">
          <TableBody>
            <TableRow>
              <TableCell align="center" style={{ border: '1px solid black' }}>Category</TableCell>
              <TableCell align="center" style={{ border: '1px solid black' }}>{product.category}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="center" style={{ border: '1px solid black' }}>Name</TableCell>
              <TableCell align="center" style={{ border: '1px solid black' }}>{product.name}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="center" style={{ border: '1px solid black' }}>Modal Name</TableCell>
              <TableCell align="center" style={{ border: '1px solid black' }}>{product.modelname}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="center" style={{ border: '1px solid black' }}>Weight (g)</TableCell>
              <TableCell align="center" style={{ border: '1px solid black' }}>{product.weight}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="center" style={{ border: '1px solid black' }}>Date</TableCell>
              <TableCell align="center" style={{ border: '1px solid black' }}>{product.date}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="center" style={{ border: '1px solid black' }}>Memo</TableCell>
              <TableCell align="center" style={{ border: '1px solid black' }}>{product.memo}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    )
  );
}
