const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);

  if (password !== confirmPassword) {
    setError('As senhas não coincidem.');
    return;
  }

  setIsSubmitting(true);

  try {
    // 1️⃣ Criar usuário
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password
    });

    if (signUpError) throw signUpError;

    // ⚠️ 2️⃣ FORÇA LOGIN (ESSA É A CORREÇÃO)
    await supabase.auth.signInWithPassword({
      email,
      password
    });

    // 3️⃣ Criar tenant
    const { data: newTenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        nome_empresa: `Empresa de ${name}`
      })
      .select()
      .single();

    if (tenantError) throw tenantError;

    // 4️⃣ Agora SIM salva tenant_id (com sessão ativa)
    await supabase.auth.updateUser({
      data: {
        tenant_id: newTenant.id,
        name
      }
    });

    // 5️⃣ Criar profile
    await supabase.from('profiles').insert({
      id: authData.user!.id,
      name,
      email,
      role: 'operador',
      tenant_id: newTenant.id
    });

    await useAppStore.getState().initialize();

    navigate('/dashboard');

  } catch (err: any) {
    setError(err.message);
  } finally {
    setIsSubmitting(false);
  }
};
