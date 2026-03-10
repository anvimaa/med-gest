import { prisma } from "$lib/server/prisma";
import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
    if (!event.locals.user) {
        throw redirect(302, "/login");
    }

    try {
        const totalMedicamentos = await prisma.medicamento.count();
        const totalLotes = await prisma.lote.count();
        
        // Basic stats for MVP
        const stockBaixo = await prisma.lote.count({
            where: {
                quantidadeAtual: {
                    lt: 10 // Example threshold
                }
            }
        });

        const hoje = new Date();
        const expirados = await prisma.lote.count({
            where: {
                dataValidade: {
                    lt: hoje
                }
            }
        });

        // Recent medications
        const recentMedicamentos = await prisma.medicamento.findMany({
            take: 5,
            orderBy: {
                dataCadastro: 'desc'
            }
        });

        return {
            stats: {
                totalMedicamentos,
                totalLotes,
                stockBaixo,
                expirados
            },
            recentMedicamentos
        };
    } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
        return {
            stats: {
                totalMedicamentos: 0,
                totalLotes: 0,
                stockBaixo: 0,
                expirados: 0
            },
            recentMedicamentos: []
        };
    }
};
