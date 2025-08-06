import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../config/api';
import CnpjInput from '../components/CnpjInput';
import { cleanCnpj } from '../utils/cnpjValidator';


const login = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
        const result = await loginUser({
            cnpj: cleanCnpj(cnpj),
            senha
        });

        if (result.success) {

            const apiResponse = result.data;

            const empresaInfo = apiResponse.data;

            const empresaDataToSave = {
                id: empresaInfo.empresaId,
                empresaId: empresaInfo.empresaId,
                cnpj: empresaInfo.cnpj,
                razaoSocial: empresaInfo.razaoSocial,
                email: empresaInfo.email,
                tipo: empresaInfo.tipo,
                token: empresaInfo.token
            };

            localStorage.setItem('token', empresaInfo.token);
            localStorage.setItem('empresaData', JSON.stringify(empresaDataToSave));

            navigate('/dashboard', { replace: true });

        } else {
            setError(result.error);
        }
    } catch (err) {
        setError('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
        setLoading(false);
    }
};

export default Login;